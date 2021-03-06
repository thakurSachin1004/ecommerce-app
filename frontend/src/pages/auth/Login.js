import React, { useState, useEffect } from "react";
import { Button } from "antd";
import styled from "styled-components";
import { GoogleOutlined, MailOutlined } from "@ant-design/icons";
import { auth, googleAuthProvider } from "../../Firebase";
import Toast from "../../component/common/Toast";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { createOrUpdateUser } from "./actions";

const Login = (props) => {
  // for testing added static username and password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => ({ ...state }));
  const dispatch = useDispatch();

  useEffect(() => {
    if (user && user.token) {
      history.push("/");
    }
  }, [user]);
  const { history } = props;

  // to send link after registeration to user mail.

  const roleBasedRedirect = (role) => {
    if (role === "admin") {
      history.push("/admin/dashboard");
    } else {
      history.push("/user/dashboard");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await auth.signInWithEmailAndPassword(email, password);
      const { user } = response;
      const idTokenResult = await user.getIdTokenResult();

      // creating or updating user in our mongodb. before this we have user in firebase
      createOrUpdateUser({ authtoken: idTokenResult.token })
        .then((response) => {
          const { user } = response.data;
          dispatch({
            type: "LOGGED_IN_USER",
            payload: {
              name: user.name,
              email: user.email,
              token: idTokenResult.token,
              role: user.role,
              _id: user._id,
            },
          });
          Toast("success", "Login successfull. Welcome to Shopify.");
          roleBasedRedirect(user.role);
        })
        .catch((err) => console.log(err));
    } catch (err) {
      Toast("error", err.message);
    }
    setLoading(false);
  };

  const googleLogin = async () => {
    await auth
      .signInWithPopup(googleAuthProvider)
      .then(async (response) => {
        const { user } = response;
        const idTokenResult = await user.getIdTokenResult();
        createOrUpdateUser({ authtoken: idTokenResult.token })
          .then((response) => {
            const { user } = response.data;
            dispatch({
              type: "LOGGED_IN_USER",
              payload: {
                name: user.name,
                email: user.email,
                token: idTokenResult.token,
                role: user.role,
                _id: user._id,
              },
            });
            Toast("success", "Login successfull. Welcome to Shopify.");
            roleBasedRedirect(user.role);
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => Toast("error", err.message));
  };

  const isDataAvailable = () => {
    if (email && password && password.length > 6) {
      return false;
    }
    return true;
  };

  const loginForm = () => {
    return (
      <>
        {!user && (
          <>
            <form>
              <input
                type="email"
                className="form-control mt-4"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                required
                placeholder="Email"
              />

              <input
                type="password"
                className="form-control mt-4"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Password"
                minLength="6"
              />

              <StyledButton
                type="primary"
                disabled={isDataAvailable()}
                className="mt-10"
                icon={<MailOutlined />}
                shape="round"
                size="large"
                block
                onClick={handleSubmit}
              >
                Login with Email/Password
              </StyledButton>

              <StyledButton
                type="danger"
                className="mt-10"
                shape="round"
                size="large"
                block
                icon={<GoogleOutlined />}
                onClick={googleLogin}
              >
                Login with Google
              </StyledButton>
            </form>
            <StyledLink
              to="/forgot/password"
              className="float-right text-danger"
            >
              Forgot Password
            </StyledLink>
          </>
        )}
      </>
    );
  };

  return (
    <div className="container p-5">
      <div className="row">
        <div className="col-md-6 offset-md-3">
          {loading ? <h4>loading</h4> : loginForm()}
        </div>
      </div>
    </div>
  );
};

const StyledButton = styled(Button)`
  margin-top: 30px;
  padding: 0 !important;
  > span {
    font-size: 20px;
  }
  &:disabled {
    cursor: not-allowed;
  }
`;

const StyledLink = styled(Link)`
  transition: all 0.2s;
  &:hover {
    transform: scale(1.06);
  }
`;

export default Login;
