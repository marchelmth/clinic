export default function Link({ href, className = "", isProtected = false, children }) {
  const handleClick = (event) => {
    if (!isProtected) return;

    event.preventDefault();
    if (confirm("Anda harus masuk untuk mengakses halaman ini. Lanjutkan?")) {
      window.location.href = "/signup";
    }
  };

  return (
    <a href={href} className={className} data-protected={isProtected} onClick={handleClick}>
      {children}
    </a>
  );
}
