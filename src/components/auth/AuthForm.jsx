import { useEffect, useState } from "react";
import { useAuth } from "../../context/auth/auth-context";

const AuthForm = () => {
  const { handleLogin, handleRegister } = useAuth();
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [form, setForm] = useState({ name: "", username: "", password: "", email: "", phone_number: "", confirm_password: "" });

  const onChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === "login") {
        const res = await handleLogin({ email: form.email, password: form.password });
        if (res?.ok) setSuccess("Login berhasil");
        else setError(res?.error || "Login gagal");
      } else {
        const payload = {
          name: form.name,
          username: form.username,
          email: form.email,
          phone_number: form.phone_number,
          password: form.password,
          confirm_password: form.confirm_password,
        };
        const res = await handleRegister(payload);
        if (res?.ok) setSuccess("Registrasi berhasil, silakan login");
        else setError(res?.error || "Registrasi gagal");
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const src = "https://cdnjs.cloudflare.com/ajax/libs/lottie-player/2.0.12/lottie-player.js";
    if (!document.querySelector(`script[src="${src}"]`)) {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div>
      <div className="d-flex justify-content-center mb-3">
        <lottie-player
          src="https://assets8.lottiefiles.com/packages/lf20_uUiMgkSnl3.json"
          background="transparent"
          speed="1"
          style={{ width: "min(60vw, 300px)", height: "auto" }}
          loop
          autoplay
        ></lottie-player>
      </div>

      <div className="d-grid gap-2 mb-4">
        <div className="btn-group" role="group" aria-label="Basic mixed styles example">
          <button type="button" onClick={() => setMode("login")} className={mode === "login" ? "btn btn-dark" : "btn btn-outline-dark"}>
            Sign In
          </button>
          <button type="button" onClick={() => setMode("register")} className={mode === "register" ? "btn btn-dark" : "btn btn-outline-dark"}>
            Sign Up
          </button>
        </div>
      </div>

      <form onSubmit={submit}>
        {mode === "register" && (
          <div className="row gx-2 mb-2">
            <div className="col">
              <label className="form-label">Full Name</label>
              <input name="name" value={form.name || ""} onChange={onChange} className="form-control" required />
            </div>
            <div className="col">
              <label className="form-label">Username</label>
              <input name="username" value={form.username || ""} onChange={onChange} className="form-control" required />
            </div>
          </div>
        )}

        <div className="mb-2">
          <label className="form-label">Email</label>
          <input name="email" value={form.email} onChange={onChange} className="form-control" type="email" required />
        </div>

        {mode === "register" && (
          <div className="mb-2">
            <label className="form-label">Phone Number</label>
            <input name="phone_number" value={form.phone_number} onChange={onChange} className="form-control" required />
          </div>
        )}

        <div className="mb-2">
          <label className="form-label">Password</label>
          <input name="password" value={form.password} onChange={onChange} className="form-control" type="password" required />
        </div>

        {mode === "register" && (
          <div className="mb-2">
            <label className="form-label">Confirm Password</label>
            <input name="confirm_password" value={form.password} onChange={onChange} className="form-control" type="password" required />
          </div>
        )}

        {error && <div className="text-danger mb-2">{error}</div>}
        {success && <div className="text-success mb-2">{success}</div>}

        <div className="d-grid gap-2 mt-4">
          <button className="btn btn-dark" type="submit" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Register"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AuthForm;
