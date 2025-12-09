const form = document.getElementById("fileForm");
const select = document.getElementById("fileSelect");
const progress = document.getElementById("extractDataProgress");
const percent = document.getElementById("extractPercent");
const langSelect = document.getElementById("ocrLangSelect");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!select.value) {
    alert("Please select a document first.");
    return;
  }
  if (!langSelect.value) {
    alert("Please select a language first.");
    return;
  }
  console.log("Selected language:", langSelect.value); //debugging line

  // fake progress for now
  let p = 0;
  const interval = setInterval(() => {
    if (p >= 95) {
      clearInterval(interval);
      return;
    }
    p += 1;
    progress.value = p;
    percent.innerText = p + "%";
  }, 40);

  // Submit the form
  form.action = `/api/extract/${encodeURIComponent(
    select.value
  )}?lang=${encodeURIComponent(langSelect.value)}`;
  form.submit();
});
