import { useEffect, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const MAX_PARALLEL = 2;

export default function useProductUploadQueue() {
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);
  const generateUploadUrl = useMutation(api.products.generateUploadUrl);
  const stageImage = useMutation(api.products.stageImage);
  // Upload jobs live outside the editor, so closing it never stops a job.
  // Keep the actual File in a ref, not in React state.
  const [jobs, setJobs] = useState([]);
  const jobsRef = useRef(new Map());
  const runningRef = useRef(0);
  const nextIdRef = useRef(0);
  const [queueExpanded, setQueueExpanded] = useState(true);
  const [queueVisible, setQueueVisible] = useState(false);

  const updateJob = (id, changes) => {
    const job = jobsRef.current.get(id);
    if (!job) return;
    Object.assign(job, changes);
    syncJobs();
  };

  const syncJobs = () => setJobs(Array.from(jobsRef.current.values()).map(
    ({ file: _file, ...view }) => ({ ...view })
  ));

  // XMLHttpRequest reports actual bytes sent. Final database confirmation is
  // a separate stage; the progress bar never claims 100% before confirmation.
  const uploadWithProgress = (url, file, onProgress) =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", url);
      xhr.timeout = 120000;
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) onProgress(event.loaded / event.total);
      };
      xhr.onload = () => {
        if (xhr.status < 200 || xhr.status >= 300) {
          reject(new Error(`Image upload failed (HTTP ${xhr.status}).`));
          return;
        }
        try {
          const result = JSON.parse(xhr.responseText);
          if (!result.storageId) throw new Error("No storage ID returned.");
          resolve(result.storageId);
        } catch (error) {
          reject(error);
        }
      };
      xhr.onerror = () => reject(new Error("Network error during image upload."));
      xhr.onabort = () => reject(new Error("Upload interrupted."));
      xhr.ontimeout = () => reject(new Error("Image upload timed out."));
      xhr.send(file);
    });

  const runJob = async (job) => {
    updateJob(job.id, { status: "running", stage: "Preparing upload", progress: 4, error: "" });
    try {
      let imageId = job.payload.imageId;
      if (job.file) {
        if (!job.uploadedImageId) {
          const uploadUrl = await generateUploadUrl();
          updateJob(job.id, { stage: "Uploading image", progress: 8 });
          job.uploadedImageId = await uploadWithProgress(uploadUrl, job.file, (ratio) => {
            updateJob(job.id, { progress: Math.min(90, Math.round(8 + ratio * 82)) });
          });
        }
        imageId = job.uploadedImageId;
        if (!await stageImage({ imageId })) {
          updateJob(job.id, {
            status: "failed", stage: "Save failed", canRetry: false,
            error: "Choose a JPG, PNG or WebP image under 5 MB.",
          });
          return;
        }
      }
      if (!imageId) throw new Error("No product image selected.");
      updateJob(job.id, { stage: "Saving product", progress: 94 });
      const payload = { ...job.payload, imageId };
      if (job.editingId) {
        await updateProduct({ id: job.editingId, expectedRevision: job.expectedRevision, ...payload });
      } else {
        await createProduct({ ...payload, requestId: job.requestId });
      }
      updateJob(job.id, { status: "done", stage: "Saved successfully", progress: 100 });
    } catch (err) {
      let error = typeof err?.data === "string" ? err.data : err?.message || "Unexpected error";
      let canRetry = true;
      switch (err?.data) {
        case "PRODUCT_CHANGED":
          error = "This product changed while you were editing. Reopen it before saving again.";
          canRetry = false;
          break;
        case "PRODUCT_NOT_FOUND":
          error = "This product was deleted.";
          canRetry = false;
          break;
        case "IMAGE_MISSING":
          job.uploadedImageId = undefined;
          canRetry = Boolean(job.file);
          error = canRetry ? "The uploaded image expired. Retry to upload it again."
            : "The product image is missing. Edit the product and choose a new image.";
          break;
      }
      updateJob(job.id, { status: "failed", stage: "Save failed", error, canRetry });
    } finally {
      runningRef.current -= 1;
      drainQueue();
    }
  };

  const drainQueue = () => {
    while (runningRef.current < MAX_PARALLEL) {
      const runningProducts = new Set(Array.from(jobsRef.current.values())
        .filter(item => item.status === "running").map(item => item.editingId));
      const job = Array.from(jobsRef.current.values()).find((item) =>
        item.status === "queued" && (!item.editingId || !runningProducts.has(item.editingId))
      );
      if (!job) break;
      runningRef.current += 1;
      // Start concurrently, without awaiting. Errors are handled inside runJob.
      void runJob(job);
    }
  };

  const retryJob = (id) => {
    const job = jobsRef.current.get(id);
    if (job?.status !== "failed" || !job.canRetry) return;
    updateJob(id, { status: "queued", stage: "Waiting to retry", progress: 0, error: "" });
    setQueueVisible(true);
    drainQueue();
  };

  const clearFinished = () => {
    for (const [id, job] of jobsRef.current) {
      if (job.status === "done") jobsRef.current.delete(id);
    }
    syncJobs();
  };

  const dismissJob = (id) => {
    if (jobsRef.current.get(id)?.status !== "failed") return;
    jobsRef.current.delete(id);
    syncJobs();
  };

  const pendingCount = jobs.filter((job) => job.status === "queued" || job.status === "running").length;
  const failedCount = jobs.filter((job) => job.status === "failed").length;
  const doneCount = jobs.filter((job) => job.status === "done").length;
  const recentlyFinished = jobs.length > 0 && doneCount === jobs.length;
  const pendingNewFeatured = jobs.filter(job =>
    (job.status === "queued" || job.status === "running") && job.payload.featured && !job.editingId
  ).length;
  const overallProgress = jobs.length
    ? Math.round(jobs.reduce((sum, job) => sum + job.progress, 0) / jobs.length)
    : 0;

  useEffect(() => {
    const guard = (event) => {
      if (runningRef.current === 0 && !Array.from(jobsRef.current.values()).some(j => j.status === "queued")) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, []);

  // Completed jobs remain visible briefly, then the panel disappears.
  // Failed jobs stay visible so the admin can retry without re-entering data.
  useEffect(() => {
    if (!recentlyFinished) return;
    const timeout = window.setTimeout(() => {
      if ([...jobsRef.current.values()].some(job => job.status !== "done")) return;
      jobsRef.current.clear();
      setJobs([]);
      setQueueVisible(false);
    }, 4500);
    return () => window.clearTimeout(timeout);
  }, [recentlyFinished]);


  const countPendingFeatured = (include) => [...jobsRef.current.values()].filter(job =>
    (job.status === "queued" || job.status === "running") && job.payload.featured && include(job)
  ).length;

  const enqueue = (drafts) => {
    for (const draft of drafts) {
      const id = ++nextIdRef.current;
      jobsRef.current.set(id, {
        ...draft, id, requestId: crypto.randomUUID(),
        status: "queued", stage: "Waiting in queue", progress: 0, error: "",
      });
    }
    syncJobs();
    setQueueVisible(true);
    setQueueExpanded(true);
    drainQueue();
  };

  return {
    jobs, queueExpanded, setQueueExpanded, queueVisible, pendingCount, failedCount,
    doneCount, overallProgress, recentlyFinished, pendingNewFeatured,
    enqueue, countPendingFeatured, retryJob, dismissJob, clearFinished,
  };
}
