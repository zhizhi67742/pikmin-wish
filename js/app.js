let nickname = "";
let essenceLimit = 1200;
let petalLimit = 1200;

let wishes = [
  {
    id: 999999,
    flower: "白勿忘草",
    nickname: "範例玩家",
    createdAt: "2026/05/23 22:45",
    timeRange: "14:00 - 23:00",
    deleteAt: Date.now() + (1000 * 60 * 60 * 3),
    message: "謝謝花農",
    isExample: true
  }
];

let pending = [];
let done = [];
let wishHistory = [];
let selectedWishId = null;
let selectedPendingId = null;
let locallyDeletedWishKeys = new Set();

function getCurrentNickname() {
  const savedNickname = localStorage.getItem("flowerWishNickname") || "";
  if (savedNickname.trim()) {
    nickname = savedNickname.trim();
    return nickname;
  }

  const oldNicknameInput = document.getElementById("nicknameInput");
  if (oldNicknameInput && oldNicknameInput.value.trim()) {
    nickname = oldNicknameInput.value.trim();
    localStorage.setItem("flowerWishNickname", nickname);
    return nickname;
  }

  const gateNicknameInput = document.getElementById("gateNicknameInput");
  if (gateNicknameInput && gateNicknameInput.value.trim()) {
    nickname = gateNicknameInput.value.trim();
    localStorage.setItem("flowerWishNickname", nickname);
    return nickname;
  }

  return "";
}

function getWishKey(item) {
  return item && (typeof item.id !== "undefined" ? item.id : item.firebaseId);
}

function jsValue(value) {
  return JSON.stringify(value);
}

function getLikedDoneKeys() {
  try {
    return JSON.parse(localStorage.getItem("flowerWishLikedDoneKeys") || "[]");
  } catch (error) {
    return [];
  }
}

function hasLikedDoneKey(doneKey) {
  return getLikedDoneKeys().map(String).includes(String(doneKey));
}

function setLikedDoneKey(doneKey, liked) {
  const keys = getLikedDoneKeys().map(String);
  const key = String(doneKey);
  const nextKeys = liked
    ? Array.from(new Set([...keys, key]))
    : keys.filter(function (item) { return item !== key; });

  localStorage.setItem("flowerWishLikedDoneKeys", JSON.stringify(nextKeys));
}

const DEFAULT_FLOWER_DEX = [
  { name: "風鈴草", subtitle: "6月新花・目前無法獲得", colors: ["白", "紅", "藍"] },
  { name: "勿忘草", colors: ["白", "黃", "紅", "藍"] },
  { name: "週年玫瑰", colors: ["白", "黃", "紅", "藍"] },
  { name: "銀蓮花", colors: ["白", "黃", "紅", "藍"] },
  { name: "九重葛", colors: ["白", "黃", "紅", "藍"] },
  { name: "海芋", colors: ["白", "黃", "紅", "藍"] },
  { name: "山茶花", colors: ["白", "黃", "紅", "藍"] },
  { name: "油菜花", colors: ["白", "黃", "藍"] },
  { name: "康乃馨", colors: ["白", "黃", "紅", "藍"] },
  { name: "嘉德麗雅蘭", colors: ["白", "黃", "紅", "藍"] },
  { name: "雞冠花", colors: ["白", "黃", "紅", "藍"] },
  { name: "櫻花", colors: ["白"] },
  { name: "菊花", colors: ["白", "黃", "紅", "藍"] },
  { name: "鐵線蓮", colors: ["白", "黃", "紅", "藍"] },
  { name: "彼岸花", colors: ["白", "黃", "紅"] },
  { name: "鈴蘭", colors: ["白", "紅"] },
  { name: "大波斯菊", colors: ["白", "黃", "紅"] },
  { name: "兔耳花", colors: ["白", "紅", "藍"] },
  { name: "大理花", colors: ["白", "黃", "紅", "藍"] },
  { name: "石竹", colors: ["白", "紅", "藍"] },
  { name: "小蒼蘭", colors: ["白", "黃", "紅", "藍"] },
  { name: "龍膽", colors: ["白", "紅", "藍"] },
  { name: "聖誕玫瑰", colors: ["白", "黃", "紅", "藍"] },
  { name: "扶桑花", colors: ["白", "黃", "紅", "藍"] },
  { name: "風信子", colors: ["白", "黃", "紅", "藍"] },
  { name: "繡球花", colors: ["白", "紅", "藍"] },
  { name: "鳶尾花", colors: ["白", "黃", "紅", "藍"] },
  { name: "百合", colors: ["白", "黃", "紅"] },
  { name: "萬壽菊", colors: ["白", "黃", "紅"] },
  { name: "牽牛花", colors: ["白", "黃", "紅", "藍"] },
  { name: "蝴蝶蘭", colors: ["白", "黃", "紅", "藍"] },
  { name: "水仙花", colors: ["白", "黃"] },
  { name: "粉蝶花", colors: ["藍"] },
  { name: "睡蓮", colors: ["白", "黃", "紅", "藍"] },
  { name: "三色堇", colors: ["白", "黃", "紅", "藍"] },
  { name: "牡丹", colors: ["白", "黃", "紅", "藍"] },
  { name: "矮牽牛", colors: ["白", "黃", "紅", "藍"] },
  { name: "梅花", colors: ["白", "黃", "紅"] },
  { name: "雞蛋花", colors: ["白", "黃", "紅"] },
  { name: "聖誕紅", colors: ["白", "黃", "紅", "藍"] },
  { name: "櫻草花", colors: ["白", "黃", "紅", "藍"] },
  { name: "玫瑰", colors: ["白", "黃", "紅", "藍"] },
  { name: "鼠尾草", colors: ["白", "黃", "紅", "藍"] },
  { name: "金魚草", colors: ["白", "黃", "紅", "藍"] },
  { name: "雪花蓮", colors: ["白", "黃", "紅"] },
  { name: "天堂鳥", colors: ["白", "黃", "紅"] },
  { name: "向日葵", colors: ["黃"] },
  { name: "豌豆花", colors: ["白", "黃", "紅", "藍"] },
  { name: "鬱金香", colors: ["白", "黃", "紅", "藍"] },
  { name: "鸚鵡鬱金香", colors: ["白", "黃", "紅", "藍"] }
];

let flowerDex = JSON.parse(JSON.stringify(DEFAULT_FLOWER_DEX));
let dexFilterMode = "all";
let dexActiveFilters = [];

document.addEventListener("DOMContentLoaded", function () {
  buildTimeOptions();
  loadData();
  fixExampleCardMessageSafely();
  updateLimitInputs();
  renderAll();
});

function buildTimeOptions() {
  const hourIds = ["startHour", "endHour"];
  const minuteIds = ["startMinute", "endMinute"];

  hourIds.forEach(function (id) {
    const el = document.getElementById(id);
    for (let i = 0; i <= 23; i++) {
      const option = document.createElement("option");
      option.value = String(i).padStart(2, "0");
      option.textContent = String(i).padStart(2, "0");
      el.appendChild(option);
    }
  });

  minuteIds.forEach(function (id) {
    const el = document.getElementById(id);
    ["00", "10", "20", "30", "40", "50"].forEach(function (m) {
      const option = document.createElement("option");
      option.value = m;
      option.textContent = m;
      el.appendChild(option);
    });
  });

  document.getElementById("startHour").value = "14";
  document.getElementById("endHour").value = "20";
}

function showSection(sectionId, btn) {
  document.querySelectorAll(".page-section").forEach(function (section) {
    section.classList.remove("active");
  });
  document.getElementById(sectionId).classList.add("active");

  document.querySelectorAll(".nav-btn").forEach(function (item) {
    item.classList.remove("active");
  });
  btn.classList.add("active");
}

function saveNickname() {
  const input = document.getElementById("nicknameInput");
  if (!input) return;

  nickname = input ? input.value.trim() : "";

  if (!nickname) {
    alert("請先輸入 LINE 社群暱稱。");
    return;
  }

  localStorage.setItem("flowerWishNickname", nickname);
  alert("暱稱已設定：" + nickname);
}

function addWish() {
  const flower = document.getElementById("flowerInput").value.trim();
  const message = document.getElementById("messageInput").value.trim();

  nickname = getCurrentNickname();

  if (!nickname) {
    alert("請先設定暱稱，建議使用 LINE 社群暱稱。");
    return;
  }

  if (!flower) {
    alert("請輸入花種。");
    return;
  }

  const start = document.getElementById("startHour").value + ":" + document.getElementById("startMinute").value;
  const end = document.getElementById("endHour").value + ":" + document.getElementById("endMinute").value;

  wishes.unshift({
    id: Date.now(),
    flower: flower,
    nickname: nickname,
    createdAt: formatNow(),
    timeRange: start + " - " + end,
    deleteAt: getWishDeleteAtFromEndTime(end),
    message: message || "沒有留言",
    isExample: false
  });

  document.getElementById("flowerInput").value = "";
  document.getElementById("messageInput").value = "";
  saveData();
  renderAll();
}

function openConfirmModal(id) {
  selectedWishId = id;
  const modal = document.getElementById("confirmModal");
  if (modal) {
    modal.classList.add("show");
  }
}

// 給動態產生的卡片使用：避免 inline onclick 在某些瀏覽器/同步卡片上失效


document.addEventListener("click", function (event) {
  const helpBtn = event.target.closest(".help-btn[data-wish-key]");
  if (helpBtn && !helpBtn.disabled) {
    event.preventDefault();
    openConfirmModal(helpBtn.dataset.wishKey);
    return;
  }

  const doneBtn = event.target.closest(".done-btn[data-pending-key]");
  if (doneBtn && !doneBtn.disabled) {
    event.preventDefault();
    openDoneModal(doneBtn.dataset.pendingKey);
    return;
  }

  const likeBtn = event.target.closest(".like-btn[data-done-key]");
  if (likeBtn) {
    event.preventDefault();
    toggleLike(likeBtn.dataset.doneKey);
    return;
  }

  const copyBtn = event.target.closest(".copy-btn[data-done-key]");
  if (copyBtn) {
    event.preventDefault();
    copyCoords(copyBtn.dataset.doneKey);
  }
});

function bindDynamicButtons() {
  document.querySelectorAll(".help-btn[data-wish-key]").forEach(function (btn) {
    btn.onclick = function () {
      openConfirmModal(btn.dataset.wishKey);
    };
  });

  document.querySelectorAll(".done-btn[data-pending-key]").forEach(function (btn) {
    btn.onclick = function () {
      openDoneModal(btn.dataset.pendingKey);
    };
  });

  document.querySelectorAll(".delete-btn[data-delete-wish]").forEach(function (btn) {
    btn.onclick = function () {
      deleteWish(btn.dataset.deleteWish);
    };
  });
}

function deleteWish(id) {
  const wishIndex = wishes.findIndex(function (item) {
    return String(getWishKey(item)) === String(id);
  });

  if (wishIndex === -1) return;

  const wish = wishes[wishIndex];

  if (wish.status === "pending" || wish.status === "done") {
    alert("已被接單的願望不可刪除。");
    return;
  }

  if (String(getCurrentNickname()).trim() !== String(wish.nickname).trim()) {
    alert("只有原許願者可以刪除。");
    return;
  }

  if (!confirm("確定要刪除這個願望嗎？")) return;

  const deletedWish = wishes[wishIndex];
  const deletedKey = String(deletedWish.firebaseId || deletedWish.id || id || "");
  if (deletedKey) locallyDeletedWishKeys.add(deletedKey);

  const cancelHistoryRecord = makeWishHistoryRecord({
    id: deletedWish.id,
    firebaseId: deletedWish.firebaseId,
    sourceWishId: deletedWish.firebaseId || deletedWish.id || "",
    flower: deletedWish.flower,
    farmer: "—",
    acceptedBy: "—",
    nickname: deletedWish.nickname,
    doneAt: Date.now()
  }, "已取消");

  addLocalWishHistory(cancelHistoryRecord);

  wishes.splice(wishIndex, 1);
  saveData();
  renderAll();

  if (deletedWish.firebaseId && window.firebaseDB && window.firebaseFns) {
    const { deleteDoc, doc } = window.firebaseFns;
    deleteDoc(doc(window.firebaseDB, "wishes", deletedWish.firebaseId))
      .catch(function (error) {
        console.error("Firebase 刪除同步失敗", error);
        alert("雲端刪除失敗，請檢查 Firebase 規則或網路連線。");
      });
  }

  syncWishHistoryToCloud(cancelHistoryRecord);
}

function closeConfirmModal() {
  selectedWishId = null;
  document.getElementById("confirmModal").classList.remove("show");
}

function confirmTakeOrder() {
  nickname = getCurrentNickname();

  if (!nickname) {
    alert("請先輸入 LINE 社群暱稱，才能接單。");
    openRuleModal();
    return;
  }

  const wishIndex = wishes.findIndex(function (item) {
    return String(getWishKey(item)) === String(selectedWishId);
  });

  if (wishIndex === -1) {
    closeConfirmModal();
    return;
  }

  if (wishes[wishIndex].isExample) {
    alert("範例卡不能接單。");
    closeConfirmModal();
    return;
  }

  const wish = wishes.splice(wishIndex, 1)[0];
  wish.farmer = nickname;
  wish.acceptedBy = nickname;
  wish.acceptedAt = formatNow();
  wish.status = "pending";
  pending.unshift(wish);

  if (wish.firebaseId && window.firebaseDB && window.firebaseFns) {
    const { updateDoc, doc } = window.firebaseFns;
    updateDoc(doc(window.firebaseDB, "wishes", wish.firebaseId), {
      acceptedBy: nickname,
      farmer: nickname,
      acceptedAt: wish.acceptedAt,
      status: "pending"
    }).catch(function (error) {
      console.error("Firebase 接單同步失敗", error);
    });
  }

  closeConfirmModal();
  saveData();
  renderAll();
}

function isCurrentFarmer(item) {
  const currentName = getCurrentNickname();
  const farmerName = item && (item.farmer || item.acceptedBy || "");
  return currentName && farmerName && String(currentName).trim() === String(farmerName).trim();
}

function openDoneModal(id) {
  const target = pending.find(function (item) {
    return String(getWishKey(item)) === String(id);
  });

  if (!target) return;

  if (!isCurrentFarmer(target)) {
    alert("只有接單花農可以按完成分享。");
    return;
  }

  selectedPendingId = id;

  // 每次打開新的完成視窗都清空欄位，避免沿用上一筆已送出的座標/採收資訊。
  const harvestInput = document.getElementById("harvestInfoInput");
  const locationInput = document.getElementById("shareLocationInput");
  if (harvestInput) harvestInput.value = "";
  if (locationInput) locationInput.value = "";

  document.getElementById("doneModal").classList.add("show");
}

function closeDoneModal() {
  selectedPendingId = null;
  document.getElementById("doneModal").classList.remove("show");
}


function previewCleanCoords() {
  const input = document.getElementById("shareLocationInput");
  const cleaned = cleanCoordinates(input.value);

  if (!cleaned) {
    alert("沒有找到有效座標。");
    return;
  }

  input.value = cleaned;
  alert("座標格式已整理完成！");
}



function openUploadConfirmModal() {
  const harvestInfo = document.getElementById("harvestInfoInput").value.trim();
  const rawLocation = document.getElementById("shareLocationInput").value;
  const cleanedLocation = cleanCoordinates(rawLocation);

  if (!cleanedLocation) {
    alert("請輸入有效座標，例如：22.817601,89.563802");
    return;
  }

  document.getElementById("shareLocationInput").value = cleanedLocation;
  document.getElementById("uploadHarvestPreview").textContent = harvestInfo || "沒有補充採收資訊";
  document.getElementById("uploadCoordCount").textContent = cleanedLocation.split("\n").filter(Boolean).length;

  document.getElementById("doneModal").classList.remove("show");
  document.getElementById("uploadConfirmModal").classList.add("show");
}

function closeUploadConfirmModal() {
  document.getElementById("uploadConfirmModal").classList.remove("show");
  document.getElementById("doneModal").classList.add("show");
}



function makeWishHistoryRecord(item, statusText) {
  const farmerName = item.farmer || item.acceptedBy || getCurrentNickname() || "花農";
  const requesterName = item.nickname || item.requester || "許願者";
  const finishedTime = formatHistoryTime(item.doneAt || Date.now());

  return {
    id: item.historyId || item.firebaseId || item.id || Date.now(),
    sourceWishId: item.sourceWishId || item.firebaseId || item.id || "",
    flower: item.flower || "花朵",
    farmer: farmerName,
    requester: requesterName,
    status: statusText || "已完成",
    time: finishedTime,
    createdAt: Date.now()
  };
}

function formatHistoryTime(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return formatNow ? formatNow() : "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${month}/${day} ${hour}:${minute}`;
}

function getWishHistoryUniqueKey(item) {
  const sourceKey = String(item.sourceWishId || item.id || item.firebaseId || "");
  if (sourceKey) {
    return sourceKey + "|" + String(item.status || "");
  }

  return [
    item.flower || "",
    item.farmer || "",
    item.requester || "",
    item.status || "",
    item.time || ""
  ].join("|");
}

function addLocalWishHistory(record) {
  const key = getWishHistoryUniqueKey(record);
  const exists = wishHistory.some(function (item) {
    return getWishHistoryUniqueKey(item) === key;
  });

  if (!exists) {
    wishHistory.unshift(record);
  }
}

function renderWishHistory() {
  const list = document.getElementById("wishHistoryList");
  if (!list) return;

  const header = '<div class="wish-history-item history-sticky-head">花朵｜花農 → 許願者｜是否完成｜時間</div>';
  const seenHistoryKeys = new Set();
  const records = (Array.isArray(wishHistory) ? wishHistory.slice() : []).filter(function (item) {
    const key = getWishHistoryUniqueKey(item);
    if (seenHistoryKeys.has(key)) return false;
    seenHistoryKeys.add(key);
    return true;
  });

  records.sort(function (a, b) {
    const timeA = new Date(a.createdAt || 0).getTime() || 0;
    const timeB = new Date(b.createdAt || 0).getTime() || 0;
    return timeB - timeA;
  });

  if (records.length === 0) {
    list.innerHTML = header + '<div class="empty">目前還沒有歷史許願紀錄。</div>';
    return;
  }

  list.innerHTML = header + records.map(function (item) {
    return `<div class="wish-history-item">${escapeHtml(item.flower || "花朵")}｜${escapeHtml(item.farmer || "花農")} → ${escapeHtml(item.requester || "許願者")}｜${escapeHtml(item.status || "已完成")}｜${escapeHtml(item.time || "")}</div>`;
  }).join("");
}

async function syncWishHistoryToCloud(record) {
  if (!window.firebaseDB || !window.firebaseFns) return;

  const { collection, addDoc } = window.firebaseFns;

  try {
    await addDoc(collection(window.firebaseDB, "wishHistory"), record);
  } catch (error) {
    console.error("Firebase 歷史許願同步失敗", error);
  }
}


async function confirmDone() {
  const harvestInfo = document.getElementById("harvestInfoInput").value.trim();
  const rawLocation = document.getElementById("shareLocationInput").value;
  const location = cleanCoordinates(rawLocation);

  if (!location) {
    alert("請輸入有效座標，例如：22.817601,89.563802");
    return;
  }

  const pendingIndex = pending.findIndex(function (item) {
    return String(getWishKey(item)) === String(selectedPendingId);
  });

  if (pendingIndex === -1) return;

  if (!isCurrentFarmer(pending[pendingIndex])) {
    alert("只有接單花農可以送出完成分享。");
    return;
  }

  const item = pending.splice(pendingIndex, 1)[0];
  item.harvestInfo = harvestInfo || "沒有補充採收資訊";
  item.location = location;
  if (typeof item.id === "undefined") item.id = Date.now();
  item.doneAt = Date.now();
  item.deleteAt = Date.now() + 60 * 60 * 1000;
  item.likes = 0;
  item.liked = false;

  done.unshift(item);

  const historyRecord = makeWishHistoryRecord(item, "已完成");
  addLocalWishHistory(historyRecord);
  await syncWishHistoryToCloud(historyRecord);

  // 如果這筆願望來自 Firebase，要同步標記為完成。
  // 否則即時同步會再次把它從雲端讀回「待完成」，看起來就像網站回朔。
  if (item.firebaseId && window.firebaseDB && window.firebaseFns) {
    const { updateDoc, doc } = window.firebaseFns;
    try {
      await updateDoc(doc(window.firebaseDB, "wishes", item.firebaseId), {
        status: "done",
        harvestInfo: item.harvestInfo,
        location: item.location,
        doneAt: item.doneAt,
        deleteAt: item.deleteAt,
        farmer: item.farmer || item.acceptedBy || nickname,
        acceptedBy: item.acceptedBy || item.farmer || nickname,
        likes: item.likes || 0
      });
    } catch (error) {
      console.error("Firebase 完成同步失敗", error);
      alert("本機已完成，但雲端同步失敗。請重新整理後確認是否還在待完成區。");
    }
  }

  selectedPendingId = null;
  document.getElementById("shareLocationInput").value = "";
  document.getElementById("harvestInfoInput").value = "";

  closeDoneModal();
  document.getElementById("uploadConfirmModal").classList.remove("show");
  saveData();
  renderAll();
}

function renderAll() {
  renderWishes();
  renderPending();
  renderDone();
  renderWishHistory();
  renderDex();
  bindDynamicButtons();
}

function renderWishes() {
  removeExpiredWishes();
  const list = document.getElementById("wishList");
  list.innerHTML = "";

  if (wishes.length === 0) {
    list.innerHTML = '<div class="empty">目前沒有願望卡。</div>';
    return;
  }

  wishes.forEach(function (wish) {
    const cardClass = wish.isExample ? "card example-card" : "card";
    if (wish.status === "pending" || wish.status === "done") return;

    const wishKey = getWishKey(wish);
    const canDelete = !wish.isExample && getCurrentNickname() && String(getCurrentNickname()).trim() === String(wish.nickname).trim();
    const actionButton = wish.isExample
      ? `<button class="help-btn disabled-btn" disabled>範例卡不能接單</button>`
      : `
          <div class="wish-actions">
            <button class="help-btn" type="button" data-wish-key="${escapeHtml(wishKey)}">我可以幫忙</button>
            ${canDelete ? `<button class="delete-btn" type="button" data-delete-wish="${escapeHtml(wishKey)}" aria-label="刪除自己的許願">🗑️ 刪除許願</button>` : ""}
          </div>
        `;

    list.innerHTML += `
      <article class="${cardClass}">
        <h3>🌸 ${escapeHtml(wish.flower)}</h3>
        <p>👤 暱稱：${escapeHtml(wish.nickname)}</p>
        <p>🕒 發願時間：${escapeHtml(wish.createdAt)}</p>
        ${wish.isExample ? `
          <div class="expire-banner">
            ⏰ 剩餘時間・3小時00分
          </div>
        ` : (wish.deleteAt ? `
          <div class="${isEndingSoon(wish.deleteAt) ? "expire-banner warning" : "expire-banner"}">
            ${isEndingSoon(wish.deleteAt) ? "⚠️ 即將結束" : "⏰ 剩餘時間"}
            ・${formatRemainTime(wish.deleteAt)}
          </div>
        ` : "")}

        <p>🌙 可收花時間：${escapeHtml(wish.timeRange)}</p>
        <p>💬 ${escapeHtml(wish.message)}</p>
        ${actionButton}
      </article>
    `;
  });
}

function renderPending() {
  const list = document.getElementById("pendingList");
  list.innerHTML = "";

  if (pending.length === 0) {
    list.innerHTML = '<div class="empty">目前沒有待完成願望。</div>';
    return;
  }

  pending.forEach(function (item) {
    const canComplete = isCurrentFarmer(item);
    const actionButton = canComplete
      ? `<button class="done-btn" type="button" data-pending-key="${escapeHtml(getWishKey(item))}">完成分享</button>`
      : `<button class="done-btn disabled-btn" type="button" disabled>等待花農完成分享</button>`;

    list.innerHTML += `
      <article class="card">
        <h3>🌱 ${escapeHtml(item.flower)}</h3>
        <p>👤 發願者：${escapeHtml(item.nickname || "匿名許願者")}</p>
        <p>🕒 發願時間：${escapeHtml(item.createdAt || "未記錄")}</p>
        <p>🌙 可收花時間：${escapeHtml(item.timeRange || "未設定")}</p>
        <p>🌱 接單花農：${escapeHtml(item.farmer || item.acceptedBy || "花農")}</p>
        <p class="hint">狀態：花農已接單，待完成分享。</p>
        ${actionButton}
      </article>
    `;
  });
}

function renderDone() {
  const now = Date.now();
  done = done.filter(function (item) {
    return !item.deleteAt || item.deleteAt > now;
  });

  const list = document.getElementById("doneList");
  list.innerHTML = "";

  if (done.length === 0) {
    list.innerHTML = '<div class="empty">目前沒有完成分享。</div>';
    return;
  }

  done.forEach(function (item) {
    if (typeof item.id === "undefined") item.id = item.firebaseId || Date.now();
    if (typeof item.likes === "undefined") item.likes = 0;
    const doneKey = getWishKey(item);
    item.liked = hasLikedDoneKey(doneKey);

    list.innerHTML += `
      <article class="card">
        <h3>✨ ${escapeHtml(item.flower)}</h3>
        <p>👤 發願者：${escapeHtml(item.nickname)}</p>
        <p>🌱 接單花農：${escapeHtml(item.farmer)}</p>
        <p>🌼 採收資訊：${escapeHtml(item.harvestInfo)}</p>
        <p>📍 分享地點／座標：</p>
        <pre class="coord-list" id="coord-${item.id}">${escapeHtml(item.location).replace(/\\n/g, "\n")}</pre>

        <div class="done-actions">
          <button class="like-btn ${item.liked ? "liked" : ""}" type="button" data-done-key="${escapeHtml(doneKey)}">
            👍 ${item.likes}
          </button>
          <button class="copy-btn" type="button" data-done-key="${escapeHtml(doneKey)}">
            快速複製整串座標
          </button>
        </div>

        <p>⏰ 剩餘刪除時間：${getRemainTime(item.deleteAt)}</p>
      </article>
    `;
  });

  saveData();
}

setInterval(function () {
  renderWishes();
  renderDone();
  bindDynamicButtons();
  saveData();
}, 1000);

async function toggleLike(id) {
  const item = done.find(function (x) {
    return String(getWishKey(x)) === String(id);
  });

  if (!item) return;

  const doneKey = getWishKey(item);
  const alreadyLiked = hasLikedDoneKey(doneKey);

  // 可按讚／取消按讚：再點一次會取消，數字不會低於 0
  if (alreadyLiked) {
    item.likes = Math.max(0, Number(item.likes || 0) - 1);
    item.liked = false;
    setLikedDoneKey(doneKey, false);
  } else {
    item.likes = Number(item.likes || 0) + 1;
    item.liked = true;
    setLikedDoneKey(doneKey, true);
  }


  saveData();
  renderDone();

  // 完成區的讚數要寫回 Firebase，否則重新整理或即時同步後會變回 0。
  if (item.firebaseId && window.firebaseDB && window.firebaseFns) {
    const { updateDoc, doc } = window.firebaseFns;
    try {
      await updateDoc(doc(window.firebaseDB, "wishes", item.firebaseId), {
        likes: item.likes
      });
    } catch (error) {
      console.warn("讚數同步失敗", error);
      alert("讚數同步失敗，請稍後再試。");
    }
  }
}

function copyCoords(id) {
  const item = done.find(function (x) {
    return String(getWishKey(x)) === String(id);
  });

  if (!item) return;

  const coordCount = item.location.split("\n").filter(Boolean).length;

  navigator.clipboard.writeText(item.location).then(function () {
    alert("已複製 " + coordCount + " 組座標！");
  }).catch(function () {
    const temp = document.createElement("textarea");
    temp.value = item.location;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    document.body.removeChild(temp);
    alert("已複製 " + coordCount + " 組座標！");
  });
}

function renderDex() {
  const list = document.getElementById("flowerDexList");
  const searchInput = document.getElementById("dexSearchInput");
  const keyword = searchInput ? searchInput.value.trim() : "";

  if (!list) return;

  list.innerHTML = "";
  updateDexFilterButtons();

  const filteredDex = flowerDex.filter(function (flower) {
    if (keyword && !flower.name.includes(keyword)) return false;

    return flower.colors.some(function (color) {
      return isDexRowMatchingFilter(flower.name, color);
    });
  });

  if (filteredDex.length === 0) {
    list.innerHTML = '<div class="empty">找不到符合的花種。</div>';
    return;
  }

  const openedFlowerNames = Array.from(document.querySelectorAll(".dex-item.open .dex-title"))
    .map(function (btn) { return (btn.dataset.flowerName || "").trim(); })
    .filter(Boolean);

  filteredDex.forEach(function (flower, index) {
    let rows = "";

    flower.colors.forEach(function (color) {
      const essenceKey = `dex_${flower.name}_${color}_essence`;
      const petalKey = `dex_${flower.name}_${color}_petal`;

      const essence = Number(safeGetLocalStorage(essenceKey) || 0);
      const petal = Number(safeGetLocalStorage(petalKey) || 0);

      if (!isDexRowMatchingFilter(flower.name, color)) return;

      rows += `
        <tr>
          <td>${getColorEmoji(color)} ${color}</td>

          <td>
            <div class="dex-input-line">
              <input
                type="number"
                min="0"
                max="${essenceLimit}"
                value="${essence}"
                oninput="saveDexValue('${essenceKey}', this.value, ${essenceLimit}, false)"
                onchange="saveDexValue('${essenceKey}', this.value, ${essenceLimit}, false)"
              />
              <span>/ ${essenceLimit}</span>
            </div>
          </td>

          <td>
            <div class="dex-input-line">
              <input
                type="number"
                min="0"
                max="${petalLimit}"
                value="${petal}"
                oninput="saveDexValue('${petalKey}', this.value, ${petalLimit}, false)"
                onchange="saveDexValue('${petalKey}', this.value, ${petalLimit}, false)"
              />
              <span>/ ${petalLimit}</span>
            </div>
          </td>

          <td>${getDexStatus(essence, petal)}</td>

          <td>
            <button class="confirm-btn" onclick="wishFromDex('${flower.name}', '${color}')">缺</button>
          </td>
        </tr>
      `;
    });

    const subtitle = flower.subtitle ? `<span class="flower-subtitle">（${escapeHtml(flower.subtitle)}）</span>` : "";

    list.innerHTML += `
      <div class="dex-item ${(openedFlowerNames.length ? openedFlowerNames.includes(flower.name) : index === 0) ? "open" : ""}">
        <button class="dex-title" data-flower-name="${escapeHtml(flower.name)}" onclick="toggleDex(this)">🌼 ${escapeHtml(flower.name)}${subtitle} ▼</button>
        <div class="dex-content">
          <table class="dex-table">
            <thead>
              <tr>
                <th>顏色</th>
                <th>精華</th>
                <th>花瓣</th>
                <th>狀態</th>
                <th>快速許願</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    `;
  });
}


function getDexFilterGroup(mode) {
  if (["missing", "full", "essence", "petal"].includes(mode)) return "status";
  if (["white", "yellow", "red", "blue"].includes(mode)) return "color";
  if (["forget", "rose"].includes(mode)) return "monthly";
  return "all";
}

function getDexActiveFilterGroups() {
  const groups = { status: [], color: [], monthly: [] };

  dexActiveFilters.forEach(function (mode) {
    const group = getDexFilterGroup(mode);
    if (groups[group]) groups[group].push(mode);
  });

  return groups;
}

function isDexRowMatchingFilter(flowerName, color) {
  if (!Array.isArray(dexActiveFilters) || dexActiveFilters.length === 0) return true;

  const essence = Number(safeGetLocalStorage(`dex_${flowerName}_${color}_essence`) || 0);
  const petal = Number(safeGetLocalStorage(`dex_${flowerName}_${color}_petal`) || 0);
  const isFull = essence >= essenceLimit && petal >= petalLimit;
  const filters = getDexActiveFilterGroups();

  const statusOk = filters.status.length === 0 || filters.status.some(function (mode) {
    if (mode === "missing") return !isFull;
    if (mode === "full") return isFull;
    if (mode === "essence") return essence < essenceLimit;
    if (mode === "petal") return petal < petalLimit;
    return true;
  });

  const colorMap = { white: "白", yellow: "黃", red: "紅", blue: "藍" };
  const colorOk = filters.color.length === 0 || filters.color.some(function (mode) {
    return color.includes(colorMap[mode]);
  });

  const monthlyOk = filters.monthly.length === 0 || filters.monthly.some(function (mode) {
    if (mode === "forget") return flowerName.includes("勿忘草");
    if (mode === "rose") return flowerName.includes("週年玫瑰") || flowerName.includes("周年玫瑰") || flowerName.includes("周年紀念玫瑰");
    return true;
  });

  return statusOk && colorOk && monthlyOk;
}

function toggleDexAdvanced() {
  const panel = document.getElementById("dexAdvancedPanel");
  const btn = document.getElementById("dexAdvancedBtn");
  if (!panel) return;

  const isOpen = panel.classList.toggle("open");
  if (btn) btn.classList.toggle("active", isOpen);
}

function setDexFilter(mode) {
  mode = mode || "all";

  if (mode === "all") {
    dexActiveFilters = [];
  } else {
    dexActiveFilters = Array.isArray(dexActiveFilters) ? dexActiveFilters : [];
    if (dexActiveFilters.includes(mode)) {
      dexActiveFilters = dexActiveFilters.filter(function (item) { return item !== mode; });
    } else {
      dexActiveFilters.push(mode);
    }
  }

  dexFilterMode = dexActiveFilters.length ? dexActiveFilters.join(",") : "all";
  safeSetLocalStorage("flowerDexActiveFilters", JSON.stringify(dexActiveFilters));
  safeSetLocalStorage("flowerDexFilterMode", dexFilterMode);
  renderDex();
}

function updateDexFilterButtons() {
  dexActiveFilters = Array.isArray(dexActiveFilters) ? dexActiveFilters : [];

  document.querySelectorAll(".dex-filter-btn").forEach(function (btn) {
    const mode = btn.dataset.filter;
    btn.classList.toggle("active", mode === "all" ? dexActiveFilters.length === 0 : dexActiveFilters.includes(mode));
  });
}

function toggleDex(btn) {
  btn.parentElement.classList.toggle("open");
}

function saveDexValue(key, value, limit, shouldRender) {
  let number = Number(value);

  if (Number.isNaN(number)) number = 0;
  if (number < 0) number = 0;
  if (number > limit) number = limit;
  if (number > 1200) number = 1200;

  safeSetLocalStorage(key, String(number));
  saveDexBackupValue(key, number);

  if (shouldRender !== false) {
    renderDex();
  }
}

function saveGlobalLimit(type, value) {
  let number = Number(value);

  if (number < 1) number = 1;
  if (number > 1200) number = 1200;

  if (type === "essence") {
    essenceLimit = number;
    safeSetLocalStorage("flowerWishEssenceLimit", String(number));
  }

  if (type === "petal") {
    petalLimit = number;
    safeSetLocalStorage("flowerWishPetalLimit", String(number));
  }

  clampDexValuesToLimits();
  updateLimitInputs();
  renderDex();
  scheduleDexCloudSave();
}

function updateLimitInputs() {
  const essenceInput = document.getElementById("essenceLimitInput");
  const petalInput = document.getElementById("petalLimitInput");

  if (essenceInput) essenceInput.value = essenceLimit;
  if (petalInput) petalInput.value = petalLimit;
}

function clampDexValuesToLimits() {
  flowerDex.forEach(function (flower) {
    flower.colors.forEach(function (color) {
      const essenceKey = `dex_${flower.name}_${color}_essence`;
      const petalKey = `dex_${flower.name}_${color}_petal`;

      const essence = Number(safeGetLocalStorage(essenceKey) || 0);
      const petal = Number(safeGetLocalStorage(petalKey) || 0);

      if (essence > essenceLimit) {
        safeSetLocalStorage(essenceKey, String(essenceLimit));
        saveDexBackupValue(essenceKey, essenceLimit);
      }

      if (petal > petalLimit) {
        safeSetLocalStorage(petalKey, String(petalLimit));
        saveDexBackupValue(petalKey, petalLimit);
      }
    });
  });
}

function wishFromDex(name, color) {
  const firstBtn = document.querySelectorAll(".nav-btn")[0];
  showSection("wish", firstBtn);
  document.getElementById("flowerInput").value = color + "色" + name;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function getDexStatus(essence, petal) {
  if (essence >= essenceLimit && petal >= petalLimit) {
    return '<span class="status-full">已滿 ✨</span>';
  }

  if (essence < Math.min(100, essenceLimit) || petal < Math.min(100, petalLimit)) {
    return '<span class="status-low">不足 ⚠️</span>';
  }

  return "收集中 🌱";
}

function getColorEmoji(color) {
  const map = {
    "白": "🤍",
    "黃": "💛",
    "紅": "❤️",
    "藍": "💙"
  };
  return map[color] || "🌸";
}


function getWishDeleteAtFromEndTime(endTime) {
  const now = new Date();
  const parts = endTime.split(":");
  const endDate = new Date();

  endDate.setHours(Number(parts[0]), Number(parts[1]), 0, 0);

  if (endDate.getTime() <= now.getTime()) {
    endDate.setDate(endDate.getDate() + 1);
  }

  return endDate.getTime();
}

function cleanCoordinates(rawText) {
  const text = String(rawText || "")
    .replace(/[「」『』“”‘’"'`]/g, "")
    .replace(/[，]/g, ",");

  const matches = text.match(/-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?/g) || [];

  return matches
    .map(function (item) {
      return item.replace(/\s+/g, "").trim();
    })
    .filter(function (item, index, arr) {
      return item && arr.indexOf(item) === index;
    })
    .join("\n");
}

function formatRemainTime(targetTime) {
  if (!targetTime) return "未設定";

  const remain = Math.max(0, targetTime - Date.now());
  const totalSeconds = Math.floor(remain / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}小時 ${String(minutes).padStart(2, "0")}分`;
  }

  return `${String(minutes).padStart(2, "0")}分 ${String(seconds).padStart(2, "0")}秒`;
}

function isEndingSoon(targetTime) {
  if (!targetTime) return false;
  const remain = targetTime - Date.now();
  return remain > 0 && remain <= 30 * 60 * 1000;
}


function removeDemoWishesFromStorage() {
  wishes = wishes.filter(function (wish) {
    return wish.nickname !== "小芽";
  });

  pending = pending.filter(function (wish) {
    return wish.nickname !== "小芽";
  });

  done = done.filter(function (wish) {
    return wish.nickname !== "小芽";
  });

  safeSetLocalStorage("flowerWishWishes", JSON.stringify(wishes));
  safeSetLocalStorage("flowerWishPending", JSON.stringify(pending));
  safeSetLocalStorage("flowerWishDone", JSON.stringify(done));
  safeSetLocalStorage("flowerWishHistory", JSON.stringify(wishHistory));
}

function removeExpiredWishes() {
  const now = Date.now();
  wishes = wishes.filter(function (wish) {
    return wish.isExample || !wish.deleteAt || wish.deleteAt > now;
  });
}

function formatNow() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}/${mm}/${dd} ${hh}:${mi}`;
}

function getRemainTime(deleteAt) {
  const remain = Math.max(0, deleteAt - Date.now());
  const totalSeconds = Math.floor(remain / 1000);
  const m = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function saveData() {
  safeSetLocalStorage("flowerWishNickname", nickname);
  safeSetLocalStorage("flowerWishWishes", JSON.stringify(wishes));
  safeSetLocalStorage("flowerWishPending", JSON.stringify(pending));
  safeSetLocalStorage("flowerWishDone", JSON.stringify(done));
  safeSetLocalStorage("flowerWishHistory", JSON.stringify(wishHistory));
}

function loadData() {
  nickname = safeGetLocalStorage("flowerWishNickname") || "";
  
  const oldNicknameInput = document.getElementById("nicknameInput");
  if (oldNicknameInput) {
    oldNicknameInput.value = nickname;
  }

  const savedWishes = safeGetLocalStorage("flowerWishWishes");
  const savedPending = safeGetLocalStorage("flowerWishPending");
  const savedDone = safeGetLocalStorage("flowerWishDone");
  const savedHistory = safeGetLocalStorage("flowerWishHistory");
  essenceLimit = Number(safeGetLocalStorage("flowerWishEssenceLimit") || 1200);
  petalLimit = Number(safeGetLocalStorage("flowerWishPetalLimit") || 1200);
  try {
    dexActiveFilters = JSON.parse(safeGetLocalStorage("flowerDexActiveFilters") || "[]");
  } catch (error) {
    dexActiveFilters = [];
  }

  if (!Array.isArray(dexActiveFilters)) dexActiveFilters = [];

  const oldDexFilterMode = safeGetLocalStorage("flowerDexFilterMode") || "all";
  if (dexActiveFilters.length === 0 && oldDexFilterMode !== "all" && !oldDexFilterMode.includes(",")) {
    dexActiveFilters = [oldDexFilterMode];
  }

  dexFilterMode = dexActiveFilters.length ? dexActiveFilters.join(",") : "all";

  if (savedWishes) wishes = JSON.parse(savedWishes);
  if (savedPending) pending = JSON.parse(savedPending);
  if (savedDone) done = JSON.parse(savedDone);
  if (savedHistory) wishHistory = JSON.parse(savedHistory);

  removeDemoWishesFromStorage();

  const hasExample = wishes.some(function (wish) {
    return wish.isExample === true;
  });

  if (!hasExample) {
    wishes.unshift({
      id: 999999,
      flower: "白勿忘草",
      nickname: "範例玩家",
      createdAt: "2026/05/23 22:45",
      timeRange: "14:00 - 23:00",
      deleteAt: Date.now() + (1000 * 60 * 60 * 3),
      message: "謝謝花農",
      isExample: true
    });
  }


  flowerDex = JSON.parse(JSON.stringify(DEFAULT_FLOWER_DEX));
  restoreDexBackupValues();
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function safeSetLocalStorage(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn("localStorage 寫入失敗：", key, error);
    return false;
  }
}

function safeGetLocalStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn("localStorage 讀取失敗：", key, error);
    return null;
  }
}

function getDexBackup() {
  try {
    return JSON.parse(safeGetLocalStorage("flowerDexBackupV2") || "{}");
  } catch (error) {
    return {};
  }
}

function saveDexBackupValue(key, number) {
  const backup = getDexBackup();
  backup[key] = {
    value: Number(number) || 0,
    updatedAt: Date.now()
  };
  safeSetLocalStorage("flowerDexBackupV2", JSON.stringify(backup));
  safeSetLocalStorage("flowerDexLastSavedAt", String(Date.now()));
  scheduleDexCloudSave();
}

function restoreDexBackupValues() {
  const backup = getDexBackup();

  Object.keys(backup).forEach(function (key) {
    if (safeGetLocalStorage(key) === null && backup[key] && typeof backup[key].value !== "undefined") {
      safeSetLocalStorage(key, String(backup[key].value));
    }
  });
}

function fixExampleCardMessageSafely() {
  let changed = false;

  wishes.forEach(function(wish){
    if (wish.isExample && wish.message !== "謝謝花農") {
      wish.message = "謝謝花農";
      changed = true;
    }
  });

  if (changed) {
    saveData();
  }
}



/* =========================
   花朵圖鑑雲端同步（用暱稱當同步代號）
   同一個暱稱在手機/電腦輸入後，就會讀同一份圖鑑。
========================= */

let dexCloudSaveTimer = null;
let dexCloudLoadedName = "";
let dexCloudIsApplying = false;

function getDexUserKey(name) {
  const raw = String(name || getCurrentNickname() || "").trim();
  if (!raw) return "";
  return encodeURIComponent(raw).replaceAll("/", "%2F");
}

function getDexCloudDocRef(name) {
  if (!window.firebaseDB || !window.firebaseFns || !window.firebaseFns.doc) return null;
  const key = getDexUserKey(name);
  if (!key) return null;
  return window.firebaseFns.doc(window.firebaseDB, "flowerDexUsers", key);
}

async function loadDexFromCloud(name) {
  const docRef = getDexCloudDocRef(name);
  if (!docRef || !window.firebaseFns.getDoc) return;

  try {
    const snap = await window.firebaseFns.getDoc(docRef);
    dexCloudLoadedName = String(name || getCurrentNickname() || "").trim();

    if (!snap.exists()) {
      scheduleDexCloudSave();
      return;
    }

    const data = snap.data() || {};
    const values = data.values || {};

    dexCloudIsApplying = true;

    Object.keys(values).forEach(function (key) {
      const item = values[key];
      const cloudValue = typeof item === "object" && item !== null ? item.value : item;
      const cloudUpdatedAt = typeof item === "object" && item !== null ? Number(item.updatedAt || data.updatedAt || 0) : Number(data.updatedAt || 0);
      const localBackup = getDexBackup()[key];
      const localUpdatedAt = localBackup ? Number(localBackup.updatedAt || 0) : 0;

      // 新裝置沒有資料時讀雲端；兩邊都有資料時保留更新時間較新的。
      if (safeGetLocalStorage(key) === null || cloudUpdatedAt >= localUpdatedAt) {
        safeSetLocalStorage(key, String(Number(cloudValue) || 0));
      }
    });

    if (data.essenceLimit) {
      essenceLimit = Number(data.essenceLimit) || essenceLimit;
      safeSetLocalStorage("flowerWishEssenceLimit", String(essenceLimit));
    }

    if (data.petalLimit) {
      petalLimit = Number(data.petalLimit) || petalLimit;
      safeSetLocalStorage("flowerWishPetalLimit", String(petalLimit));
    }

    // 把雲端值重新整理進備份，之後才不會被舊 localStorage 蓋回去。
    const backup = getDexBackup();
    Object.keys(values).forEach(function (key) {
      const item = values[key];
      const cloudValue = typeof item === "object" && item !== null ? item.value : item;
      backup[key] = { value: Number(cloudValue) || 0, updatedAt: Number(data.updatedAt || Date.now()) };
    });
    safeSetLocalStorage("flowerDexBackupV2", JSON.stringify(backup));

    dexCloudIsApplying = false;
    updateLimitInputs();
    renderDex();
  } catch (error) {
    dexCloudIsApplying = false;
    console.warn("圖鑑雲端讀取失敗", error);
  }
}

function scheduleDexCloudSave() {
  if (dexCloudIsApplying) return;
  if (!window.firebaseDB || !window.firebaseFns || !window.firebaseFns.setDoc) return;
  const name = getCurrentNickname();
  if (!name) return;

  clearTimeout(dexCloudSaveTimer);
  dexCloudSaveTimer = setTimeout(function () {
    saveDexToCloud(name);
  }, 500);
}

async function saveDexToCloud(name) {
  const docRef = getDexCloudDocRef(name);
  if (!docRef || !window.firebaseFns.setDoc) return;

  const backup = getDexBackup();
  const now = Date.now();
  const values = {};

  Object.keys(backup).forEach(function (key) {
    values[key] = {
      value: Number(backup[key].value) || 0,
      updatedAt: Number(backup[key].updatedAt || now)
    };
  });

  try {
    await window.firebaseFns.setDoc(docRef, {
      nickname: String(name || "").trim(),
      values: values,
      essenceLimit: essenceLimit,
      petalLimit: petalLimit,
      updatedAt: now
    }, { merge: true });
  } catch (error) {
    console.warn("圖鑑雲端儲存失敗", error);
  }
}

/* =========================
   Firebase 即時同步系統
========================= */

window.addEventListener("firebase-ready", () => {
  startFirebaseSync();
});

async function startFirebaseSync() {
  const db = window.firebaseDB;
  const {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
    setDoc,
    getDoc
  } = window.firebaseFns;

  const wishesRef = collection(db, "wishes");
  const wishHistoryRef = collection(db, "wishHistory");

  // Firebase 準備好後，先讀取這個暱稱的雲端圖鑑。
  const savedDexName = getCurrentNickname();
  if (savedDexName) {
    loadDexFromCloud(savedDexName);
  }

  // 即時同步許願卡：許願區公開、待完成區公開、完成區公開。
  onSnapshot(wishHistoryRef, (snapshot) => {
    const localHistory = wishHistory.filter(function (item) {
      return !item.firebaseId;
    });

    wishHistory = localHistory;

    snapshot.forEach((docItem) => {
      addLocalWishHistory({
        firebaseId: docItem.id,
        ...docItem.data()
      });
    });

    renderWishHistory();
  });

  onSnapshot(wishesRef, (snapshot) => {
    const localWishes = wishes.filter(function (item) {
      return !item.firebaseId;
    });
    const localPending = pending.filter(function (item) {
      return !item.firebaseId;
    });
    const localDone = done.filter(function (item) {
      return !item.firebaseId;
    });

    wishes = localWishes;
    pending = localPending;
    done = localDone;

    snapshot.forEach((docItem) => {
      const data = {
        firebaseId: docItem.id,
        ...docItem.data()
      };

      if (locallyDeletedWishKeys.has(String(data.firebaseId || data.id || ""))) {
        return;
      }

      if (data.status === "pending") {
        data.farmer = data.farmer || data.acceptedBy || "花農";
        pending.push(data);
      } else if (data.status === "done") {
        data.farmer = data.farmer || data.acceptedBy || "花農";
        done.push(data);
        addLocalWishHistory(makeWishHistoryRecord(data, "已完成"));
      } else {
        wishes.push(data);
      }
    });

    renderWishes();
    renderPending();
    renderDone();
    renderWishHistory();
    saveData();
    bindDynamicButtons();
  });

  // Firebase 新增願望
  const originalAddWish = window.addWish;

  window.addWish = async function () {
    const flower = document.getElementById("flowerInput")?.value?.trim();
    const nickname = getCurrentNickname();

    if (!nickname) {
      alert("請先輸入 LINE 社群暱稱，才能新增願望。");
      openRuleModal();
      return;
    }

    if (!flower) {
      alert("請輸入花種");
      return;
    }

    const startHour = document.getElementById("startHour")?.value || "14";
    const startMinute = document.getElementById("startMinute")?.value || "00";
    const endHour = document.getElementById("endHour")?.value || "20";
    const endMinute = document.getElementById("endMinute")?.value || "00";

    const message = document.getElementById("messageInput")?.value || "";

    const now = new Date();

    const newWish = {
      flower,
      nickname,
      createdAt: now.toLocaleString(),
      timeRange: `${startHour}:${startMinute} - ${endHour}:${endMinute}`,
      message,
      deleteAt: getWishDeleteAtFromEndTime(`${endHour}:${endMinute}`),
      createdTimestamp: Date.now(),
      status: "wish"
    };

    await addDoc(wishesRef, newWish);

    document.getElementById("flowerInput").value = "";
    if (document.getElementById("messageInput")) {
      document.getElementById("messageInput").value = "";
    }
  };

  // 接單同步
  window.acceptWish = async function(firebaseId) {
    const nickname = localStorage.getItem("flowerWishNickname") || "花農";

    const target = wishes.find(w => w.firebaseId === firebaseId);

    if (!target) return;

    const ok = confirm(`確認接單 ${target.flower} 嗎？`);

    if (!ok) return;

    await updateDoc(doc(db, "wishes", firebaseId), {
      acceptedBy: nickname,
      farmer: nickname,
      acceptedAt: formatNow(),
      status: "pending"
    });

    alert("接單成功！");
  };
}




function enterWebsite() {
  const input = document.getElementById("gateNicknameInput");
  nickname = input.value.trim();

  if (!nickname) {
    alert("請輸入 LINE 社群暱稱");
    return;
  }

  localStorage.setItem("flowerWishNickname", nickname);

  const nicknameInput = document.getElementById("nicknameInput");
  if (nicknameInput) {
    nicknameInput.value = nickname;
  }

  document.getElementById("nicknameGate").classList.add("hidden-gate");

  if (window.firebaseDB && window.firebaseFns) {
    loadDexFromCloud(nickname);
  }
}

function openRuleModal() {
  const gate = document.getElementById("nicknameGate");
  const input = document.getElementById("gateNicknameInput");
  const savedNickname = localStorage.getItem("flowerWishNickname");

  if (input && savedNickname) {
    input.value = savedNickname;
  }

  if (gate) {
    gate.classList.remove("hidden-gate");
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const savedNickname = localStorage.getItem("flowerWishNickname");
  const input = document.getElementById("gateNicknameInput");
  const nicknameInput = document.getElementById("nicknameInput");

  if (input && savedNickname) {
    input.value = savedNickname;
  }

  if (nicknameInput && savedNickname) {
    nicknameInput.value = savedNickname;
  }

  // 每次進入網站都顯示規則視窗，但暱稱會自動帶入
  const gate = document.getElementById("nicknameGate");
  if (gate) {
    gate.classList.remove("hidden-gate");
  }
});


function updateNicknameDisplay() {
  const nicknameText = document.getElementById("currentNicknameText");
  if (!nicknameText) return;

  const currentName = getCurrentNickname();
  nicknameText.textContent = currentName || "未設定";
}

function openNicknameModal() {
  const gate = document.getElementById("nicknameGate");
  if (!gate) return;

  gate.classList.remove("hidden-gate");

  const input = document.getElementById("gateNicknameInput");
  const savedNickname = localStorage.getItem("flowerWishNickname");

  if (input && savedNickname) {
    input.value = savedNickname;
  }
}

const originalEnterWebsite = enterWebsite;
enterWebsite = async function(...args) {
  const result = await originalEnterWebsite.apply(this, args);
  updateNicknameDisplay();
  return result;
};

window.addEventListener("load", () => {
  setTimeout(updateNicknameDisplay, 300);
});
