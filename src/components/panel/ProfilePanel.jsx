import { useAuth } from "../../context/auth/authContext";
import { CapitalizeFirstLetter } from "../../helpers/capitalized";

const ProfilePanel = () => {
  const { user } = useAuth();

  return (
    <>
      <div className="d-flex justify-content-center mb-3">
        <lottie-player
          src="https://assets10.lottiefiles.com/packages/lf20_myejiggj.json"
          background="transparent"
          speed="1"
          style={{ width: "min(60vw, 300px)", height: "auto" }}
          loop
          autoplay
        ></lottie-player>
      </div>
      <div className="mb-3 fw-bold text-center fs-4">Welcome back, {CapitalizeFirstLetter(user.name)}</div>
    </>
  );
};

export default ProfilePanel;
