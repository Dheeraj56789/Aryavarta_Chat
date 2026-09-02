import Login from "../components/Auth/Login";

const LoginPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen w-screen p-4 bg-[#0b0f19] text-slate-100 relative overflow-hidden">
      <div className="ambient-glow-1" />
      <div className="ambient-glow-2" />
      <div className="ambient-glow-3" />
      <Login />
    </div>
  );
};

export default LoginPage;
