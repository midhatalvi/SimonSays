import { checkPose, getVisionStatus } from "./checkPose.js";
import { POSE_NAMES } from "../shared/poses.js";

const rowsEl = document.getElementById("rows");
const statusEl = document.getElementById("status");

rowsEl.innerHTML = POSE_NAMES.map((name) => `
  <tr data-pose="${name}">
    <td>${name}</td>
    <td><div class="bar"><div class="bar-fill" style="width:0%"></div></div></td>
    <td class="matched">-</td>
  </tr>`).join("");

function tick() {
  const { status, error } = getVisionStatus();
  statusEl.textContent = `status: ${status}${error ? " — " + error : ""}`;
  for (const name of POSE_NAMES) {
    const { matched, confidence } = checkPose(name); // triggers lazy init on first call
    const row = rowsEl.querySelector(`tr[data-pose="${name}"]`);
    row.querySelector(".bar-fill").style.width = `${Math.round(confidence * 100)}%`;
    row.querySelector(".matched").textContent = matched ? "YES" : "";
  }
  requestAnimationFrame(tick);
}
tick();