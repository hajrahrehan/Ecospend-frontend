import React, { useState, useRef } from "react";

import {
  Card,
  CardBody,
  Col,
  Container,
  Input,
  Label,
  Row,
  Button,
  Form,
} from "reactstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import * as ApiManager from "../../helpers/ApiManager.tsx";

import bgImage from "assets/img/bg-sign-in-basic.jpeg";
import { useNavigate } from "react-router-dom";

function AdminSignIn() {
  const [APIWorking, setAPIWorking] = useState(false);
  const navigate = useNavigate();
  const emailRef = useRef("");
  const passRef = useRef("");

  const handleLogin = async () => {
    if (APIWorking) return;
    if (emailRef.current === "" || passRef.current === "") {
      return toast.error("Complete the fields");
    } else {
      setAPIWorking(true);
      const res = await ApiManager.AdminSignIn({
        email: emailRef.current,
        password: passRef.current,
      });
      if (res) {
        sessionStorage.clear();
        sessionStorage.setItem("@token", res.data.logintoken);
        sessionStorage.setItem("@admintoken", res.data.logintoken);
        toast.success("logged in");
        navigate("/admin/dashboard");
        return;
      }

      setAPIWorking(false);
    }
  };

  return (
    <>
      <div
        className="content"
        style={{
          background: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(15, 15, 15, 0.1)), url(${bgImage})`,
          width: "100vw",
          height: "100vh",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      >
        <Container>
          <ToastContainer />
          <Row
            className="justify-content-center"
            style={{ paddingTop: "20vh" }}
          >
            <Col md={7} lg={5} xl={4}>
              <Card>
                <Card
                  className="p-4 bg-info shadow"
                  style={{
                    width: "90%",
                    marginLeft: "5%",
                    marginTop: "-5%",
                    zIndex: 3,
                    position: "absolute",
                  }}
                >
                  <div className="text-center mt-2">
                    <h4 className={"text-white fw-bold"}>
                      <b>Admin Login!</b>
                    </h4>
                  </div>
                </Card>
                <CardBody className="p-4" style={{ marginTop: "7vh" }}>
                  <div className="p-2 mt-4">
                    <Form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleLogin();
                        return false;
                      }}
                      action="#"
                    >
                      <div className="mb-4">
                        <Label htmlFor="email" className="form-label">
                          Email
                        </Label>
                        <Input
                          name="email"
                          className="form-control"
                          placeholder="email"
                          type="email"
                          onChange={(e) => (emailRef.current = e.target.value)}
                        />
                      </div>

                      <div className="mb-4">
                        <Label className="form-label" htmlFor="password-input">
                          Password
                        </Label>
                        <div className="position-relative auth-pass-inputgroup mb-3">
                          <Input
                            name="password"
                            autoComplete="on"
                            className="form-control pe-5"
                            type="password"
                            placeholder="Enter Password"
                            onChange={(e) => (passRef.current = e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="mt-5">
                        <Button
                          color="info"
                          className={`btn btn-info w-100`}
                          style={{
                            height: "7vh",
                          }}
                          type="submit"
                          disabled={APIWorking}
                        >
                          {APIWorking ? "Running" : "Sign in"}
                        </Button>
                      </div>
                    </Form>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
}

export default AdminSignIn;
