import { useEffect, useState } from "react";
import api from "../services/api";
import { showToast } from "../utils/toast.js";
import ProfilePicture from "./ProfilePicture.jsx";

export default function Profile() {
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("auth_token");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const [isUpdate, setIsUpdate] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [emailVerified, setEmailVerified] = useState(false);

    useEffect(() => {
        let mounted = true;

        api.get("/api/user", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => {
                if (mounted && res.data?.data) {
                    const userData = res.data.data;
                    setSelectedUser(userData);
                    setName(userData.name || "");
                    setEmail(userData.email || "");
                    setEmailVerified(userData.email_verified_at !== null);
                }
            })
            .catch((error) => {
                console.error("Error fetching profile:", error);
                showToast("error", "Gagal", "Gagal mengambil data profil.");
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, [token]);

    const handleUpdateClick = () => {
        setIsEdit(true);
    };

    const handleCancelClick = () => {
        if (selectedUser) {
            setName(selectedUser.name || "");
            setEmail(selectedUser.email || "");
        }
        setIsEdit(false);
    };

    const handleSaveClick = async () => {
        const trimmedName = name.trim();
        const trimmedEmail = email.trim();

        if (!trimmedName) {
            showToast("error", "Validasi Gagal", "Nama lengkap tidak boleh kosong.");
            return;
        }
        if (!trimmedEmail) {
            showToast("error", "Validasi Gagal", "Alamat email tidak boleh kosong.");
            return;
        }

        const payload = {};
        if (trimmedName !== selectedUser.name) {
            payload.name = trimmedName;
        }
        if (trimmedEmail !== selectedUser.email) {
            payload.email = trimmedEmail;
        }

        if (Object.keys(payload).length === 0) {
            showToast("info", "Info", "Tidak ada perubahan data.");
            setIsEdit(false);
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await api.patch(
                `/api/users/${selectedUser.id}`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const updatedUser = response.data.data;
            setSelectedUser(updatedUser);
            setName(updatedUser.name);
            setEmail(updatedUser.email);
            setEmailVerified(updatedUser.email_verified_at !== null);
            setIsEdit(false);
            showToast("success", "Berhasil", "Profil Anda berhasil diperbarui!");

            if (selectedUser && (updatedUser.email_verified_at === null || updatedUser.email !== selectedUser.email)) {
                showToast("info", "Info", "Email verifikasi telah dikirim ulang.");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            const errorMsg = error.response?.data?.message || error.message || "Gagal memperbarui profil.";
            showToast("error", "Gagal Menyimpan", errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("auth_token");
        window.location.href = "/";
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Memuat profil...</span>
                </div>
            </div>
        );
    }

    if (!selectedUser) {
        return (
            <div className="alert alert-danger text-center shadow-sm" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2" />
                Sesi Anda telah berakhir. Silakan login kembali.
            </div>
        );
    }

    return (
        <div className="row g-4 justify-content-center">
            {/* Left Side: Avatar & Quick Profile Card */}
            <div className="col-12 col-lg-4">
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
                    <div className="card-header bg-gradient bg-primary py-5 text-center position-relative" style={{ minHeight: "120px" }}>
                        <div className="position-absolute top-100 start-50 translate-middle">
                            <ProfilePicture name={selectedUser.name} />
                        </div>
                    </div>
                    <div className="card-body pt-5 mt-4 text-center">
                        <h4 className="fw-bold mb-1 text-dark">{selectedUser.name}</h4>
                        <p className="text-muted small mb-3">{selectedUser.email}</p>
                        {emailVerified ? (
                            <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill fw-semibold text-uppercase mb-4">
                                Email Terverifikasi
                            </span>
                        ) : (
                            <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-3 py-2 rounded-pill fw-semibold text-uppercase mb-4">
                                Email Belum Terverifikasi
                            </span>
                        )}
                        <hr className="my-4 text-muted opacity-25" />

                        <button
                            onClick={handleLogout}
                            className="btn btn-outline-danger w-100 py-2.5 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 transition"
                        >
                            <i className="bi bi-box-arrow-right fs-5" />
                            Keluar dari Akun
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Side: Account Details form */}
            <div className="col-12 col-lg-8">
                <div className="card border-0 shadow-sm rounded-4 h-100">
                    <div className="card-body p-4 p-md-5">
                        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4 pb-3 border-bottom">
                            <div>
                                <h4 className="fw-bold mb-1 text-dark">Informasi Akun</h4>
                                <p className="text-muted small mb-0">Kelola dan perbarui informasi profil pribadi Anda</p>
                            </div>
                            <div>
                                {!isEdit ? (
                                    <button
                                        type="button"
                                        onClick={handleUpdateClick}
                                        className="btn btn-primary px-2 py-2 rounded-3 fw-bold d-inline-flex align-items-center gap-2"
                                    >
                                        <i className="bi bi-pencil-square" />
                                        Ubah Profil
                                    </button>
                                ) : (
                                    <div className="d-flex gap-2">
                                        <button
                                            type="button"
                                            disabled={isSubmitting}
                                            onClick={handleCancelClick}
                                            className="btn btn-outline-secondary px-2 py-2 rounded-3 fw-bold"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="button"
                                            disabled={isSubmitting}
                                            onClick={handleSaveClick}
                                            className="btn btn-success px-2 py-2 rounded-3 fw-bold d-inline-flex align-items-center gap-2"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                                                    Menyimpan...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-check2-circle" />
                                                    Simpan
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <form onSubmit={(e) => e.preventDefault()}>
                            <div className="mb-4">
                                <label htmlFor="inputName" className="form-label fw-bold text-secondary mb-2">
                                    Nama Lengkap
                                </label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0 text-secondary">
                                        <i className="bi bi-person fs-5" />
                                    </span>
                                    <input
                                        id="inputName"
                                        type="text"
                                        disabled={!isEdit || isSubmitting}
                                        className={`form-control py-2.5 ${isEdit ? "bg-white border-start-0" : "bg-light text-muted border-start-0"}`}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Masukkan nama lengkap Anda"
                                    />
                                </div>
                            </div>

                            <div className="mb-3">
                                <label htmlFor="inputEmail" className="form-label fw-bold text-secondary mb-2">
                                    Alamat Email
                                </label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0 text-secondary">
                                        <i className="bi bi-envelope fs-5" />
                                    </span>
                                    <input
                                        id="inputEmail"
                                        type="email"
                                        disabled={!isEdit || isSubmitting}
                                        className={`form-control py-2.5 ${isEdit ? "bg-white border-start-0" : "bg-light text-muted border-start-0"}`}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Masukkan alamat email Anda"
                                    />
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}