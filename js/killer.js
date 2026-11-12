export function setupDeleteAll(loginUrl) {
  document.addEventListener("click", (event) => {
    if (!event.target.closest("#delete-all")) return;

    // Doble seguridad: solo un admin puede borrar todo
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser?.type !== "admin") return;

    Swal.fire({
      icon: "warning",
      title: "Are you sure?",
      text: "This will delete all pins and users, and cannot be undone.",
      showCancelButton: true,
      confirmButtonColor: "#d9693f",
      cancelButtonColor: "#0f3c65",
      confirmButtonText: "Yes, delete all!",
      cancelButtonText: "Cancel",
      heightAuto: false,
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("pins");
        localStorage.removeItem("users");
        localStorage.removeItem("currentUser");
        window.location.replace(loginUrl);
      }
    });
  });
}
