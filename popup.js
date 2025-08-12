async function loadData() {
  const data = await browser.storage.local.get(["uaList", "currentUA"]);
  document.getElementById("ua").textContent = data.currentUA || "Not set yet";
  if (data.uaList) {
    document.getElementById("uaList").value = data.uaList.join("\n");
  }
}

async function setUARule(ua) {
  await browser.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1],
    addRules: [
      {
        id: 1,
        priority: 1,
        action: {
          type: "modifyHeaders",
          requestHeaders: [
            { header: "user-agent", operation: "set", value: ua },
          ],
        },
        condition: {
          urlFilter: "*",
          resourceTypes: [
            "main_frame",
            "sub_frame",
            "xmlhttprequest",
            "script",
            "image",
            "stylesheet",
            "font",
            "other",
          ],
        },
      },
    ],
  });
  await browser.storage.local.set({ currentUA: ua });
  document.getElementById("ua").textContent = ua;
}

document.getElementById("randomize").addEventListener("click", async () => {
  const { uaList } = await browser.storage.local.get("uaList");
  if (!uaList || uaList.length === 0) return;
  const randomUA = uaList[Math.floor(Math.random() * uaList.length)];
  await setUARule(randomUA);
});

document.getElementById("setUA").addEventListener("click", async () => {
  const customUA = document.getElementById("customUA").value.trim();
  if (customUA) {
    await setUARule(customUA);
  }
});

document.getElementById("saveList").addEventListener("click", async () => {
  const lines = document
    .getElementById("uaList")
    .value.split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  await browser.storage.local.set({ uaList: lines });
  document.getElementById("status").textContent = "List saved!";
  setTimeout(() => {
    document.getElementById("status").textContent = "";
  }, 1500);
});

loadData();
