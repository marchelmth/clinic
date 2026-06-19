export default function Form({
    id,
    onSubmit,
    children,
    submitText = "Submit",
    loadingText = "Memproses...",
    isSubmitting = false,
    footer = null,
    className = ""
}) {
    return (
        <>
            <form id={id} className={className} noValidate onSubmit={onSubmit}>
                {children}
                <div className="d-grid mt-4">
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? loadingText : submitText}
                    </button>
                </div>
            </form>

            {footer && (
                <div className="text-center mt-3">
                    {footer}
                </div>
            )}
        </>
    );
}