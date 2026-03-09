import React, { useState } from "react";

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
  FormFeedback,
  FormGroup,
} from "reactstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import * as ApiManager from "helpers/ApiManager.tsx";
import * as Yup from "yup";
import { useFormik } from "formik";

import bgImage from "assets/img/bg-sign-in-basic.jpeg";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-date-picker";

function SignInBasic() {
  const navigate = useNavigate();

  const [isLogin, setisLogin] = useState(true);

  const Login = () => {
    const [APIWorking, setAPIWorking] = useState(false);
    const validation = useFormik({
      enableReinitialize: true,

      initialValues: {
        email: "",
        password: "",
      },
      validationSchema: Yup.object({
        email: Yup.string()
          .required("Please enter email")
          .email("Please enter correct email"),
        password: Yup.string().required("Please enter password"),
      }),
      onSubmit: async (values) => {
        try {
          if (APIWorking) return;
          setAPIWorking(true);
          const res = await ApiManager.SignIn(values);
          if (res) {
            sessionStorage.clear();

            sessionStorage.setItem("@token", res.data.logintoken);
            toast.success("logged in");
            navigate("/main/dashboard");
            return;
          }
          setAPIWorking(false);
        } catch (e) {
          setAPIWorking(false);
          toast.error(`${e.message}`);
        }
      },
    });

    return (
      <>
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
                  <b>Welcome to Hello Bank!</b>
                </h4>
              </div>
            </Card>
            <CardBody className="p-4" style={{ marginTop: "7vh" }}>
              <div className="p-2 mt-4">
                <Form
                  onSubmit={(e) => {
                    e.preventDefault();
                    validation.handleSubmit(e);
                  }}
                  action="#"
                >
                  <div className="mb-4">
                    <Label htmlFor="email">Email</Label>
                    <div className="position-relative auth-pass-inputgroup mb-3">
                      <Input
                        name="email"
                        className="form-control pe-5"
                        placeholder="email"
                        type="text"
                        onBlur={validation.handleBlur}
                        onChange={validation.handleChange}
                        invalid={
                          validation.touched.email && validation.errors.email
                            ? true
                            : false
                        }
                      />
                      {validation.touched.email && validation.errors.email ? (
                        <FormFeedback type="invalid">
                          {validation.errors.email}
                        </FormFeedback>
                      ) : null}
                    </div>
                  </div>

                  <div className="mb-4">
                    <Label className="form-label">Password</Label>
                    <div className="position-relative auth-pass-inputgroup mb-3">
                      <Input
                        name="password"
                        autoComplete="on"
                        className="form-control pe-5"
                        type="password"
                        placeholder="Enter Password"
                        onBlur={validation.handleBlur}
                        onChange={validation.handleChange}
                        invalid={
                          validation.touched.password &&
                          validation.errors.password
                            ? true
                            : false
                        }
                      />
                      {validation.touched.password &&
                      validation.errors.password ? (
                        <FormFeedback type="invalid">
                          {validation.errors.password}
                        </FormFeedback>
                      ) : null}
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
              <Row className="mt-2">
                <Col className="text-center">
                  <Button
                    className="btn-link text-info"
                    onClick={() => setisLogin(false)}
                  >
                    Click here to Register
                  </Button>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </>
    );
  };
  const Register = () => {
    const [APIWorking, setAPIWorking] = useState(false);
    const validation = useFormik({
      enableReinitialize: true,

      initialValues: {
        fname: "",
        lname: "",
        cnic: "",
        address: "",
        gender: "m",
        bdate: "",
        email: "",
        password: "",
        type: "Basic",
      },
      validationSchema: Yup.object({
        fname: Yup.string().required("Please enter first name"),
        lname: Yup.string().required("Please enter first name"),
        cnic: Yup.string()
          .required("Please enter CNIC (without dashes)")
          .length(13, "Enter correct CNIC(without dashes)"),
        gender: Yup.string().required("Please select gender"),
        address: Yup.string().required("Please select address"),
        bdate: Yup.string().required("Please select your date of birth"),
        email: Yup.string()
          .required("Please enter email")
          .email("Please enter correct email"),
        password: Yup.string()
          .required("Please enter password")
          .min(6, "Password should be of atlleast 6 characters"),
      }),
      onSubmit: async (values, { setSubmitting, resetForm }) => {
        try {
          if (APIWorking) return;
          setAPIWorking(true);
          setSubmitting(false);
          const res = await ApiManager.Register(values);
          if (res) {
            sessionStorage.clear();

            sessionStorage.setItem("@token", res.data.logintoken);
            toast.success("Registered");
            navigate("/main/dashboard");
            return;
          }
          setAPIWorking(false);
        } catch (e) {
          setAPIWorking(false);
          toast.error(`${e.message}`);
        }
      },
    });

    return (
      <>
        <Col md={12} lg={12} xl={12}>
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
                  <b>Welcome to Hello Bank!</b>
                </h4>
              </div>
            </Card>
            <CardBody className="p-4" style={{ marginTop: "7vh" }}>
              <div className="p-2">
                <Form onSubmit={validation.handleSubmit} action="#">
                  <Row>
                    <Col xs={12} md={4}>
                      <Label htmlFor="fname">First Name</Label>
                      <div className="position-relative auth-pass-inputgroup mb-3">
                        <Input
                          name="fname"
                          className="form-control pe-5"
                          placeholder="ABCD"
                          type="text"
                          onBlur={validation.handleBlur}
                          onChange={validation.handleChange}
                          invalid={
                            validation.touched.fname && validation.errors.fname
                              ? true
                              : false
                          }
                        />
                        {validation.touched.fname && validation.errors.fname ? (
                          <FormFeedback type="invalid">
                            {validation.errors.fname}
                          </FormFeedback>
                        ) : null}
                      </div>
                    </Col>
                    <Col xs={12} md={4}>
                      <Label htmlFor="lname">Last Name</Label>
                      <div className="position-relative auth-pass-inputgroup mb-3">
                        <Input
                          name="lname"
                          className="form-control pe-5"
                          placeholder="XYZ"
                          type="text"
                          onBlur={validation.handleBlur}
                          onChange={validation.handleChange}
                          invalid={
                            validation.touched.lname && validation.errors.lname
                              ? true
                              : false
                          }
                        />
                        {validation.touched.lname && validation.errors.lname ? (
                          <FormFeedback type="invalid">
                            {validation.errors.lname}
                          </FormFeedback>
                        ) : null}
                      </div>
                    </Col>
                    <Col xs={12} md={4}>
                      <Label htmlFor="cnic">CNIC</Label>
                      <div className="position-relative auth-pass-inputgroup mb-3">
                        <Input
                          name="cnic"
                          className="form-control pe-5"
                          placeholder="00000-0000000-0"
                          type="text"
                          onBlur={validation.handleBlur}
                          onChange={(e) => {
                            let text = e.target.value.replace(/\D/g, "");
                            validation.setFieldValue("cnic", text);
                          }}
                          invalid={
                            validation.touched.cnic && validation.errors.cnic
                              ? true
                              : false
                          }
                        />
                        {validation.touched.cnic && validation.errors.cnic ? (
                          <FormFeedback type="invalid">
                            {validation.errors.cnic}
                          </FormFeedback>
                        ) : null}
                      </div>
                    </Col>
                  </Row>

                  <Row>
                    <Col xs={12} md={4}>
                      <Label htmlFor="email">Email</Label>
                      <div className="position-relative auth-pass-inputgroup mb-3">
                        <Input
                          name="email"
                          className="form-control pe-5"
                          placeholder="example@domain.com"
                          type="text"
                          onBlur={validation.handleBlur}
                          onChange={validation.handleChange}
                          invalid={
                            validation.touched.email && validation.errors.email
                              ? true
                              : false
                          }
                        />
                        {validation.touched.email && validation.errors.email ? (
                          <FormFeedback type="invalid">
                            {validation.errors.email}
                          </FormFeedback>
                        ) : null}
                      </div>
                    </Col>
                    <Col xs={12} md={4}>
                      <Label htmlFor="password">Password</Label>
                      <div className="position-relative auth-pass-inputgroup mb-3">
                        <Input
                          name="password"
                          className="form-control pe-5"
                          placeholder="* * * * * * *"
                          type="password"
                          onBlur={validation.handleBlur}
                          onChange={validation.handleChange}
                          invalid={
                            validation.touched.password &&
                            validation.errors.password
                              ? true
                              : false
                          }
                        />
                        {validation.touched.password &&
                        validation.errors.password ? (
                          <FormFeedback type="invalid">
                            {validation.errors.password}
                          </FormFeedback>
                        ) : null}
                      </div>
                    </Col>
                    <Col xs={12} md={4}>
                      <Label className={"form-check-label"} htmlFor="Basic">
                        Gender
                      </Label>
                      <Row>
                        <Col xs={{ offset: 1, size: 3 }}>
                          <div className="form-check">
                            <Input
                              type="radio"
                              name="gender"
                              id="Male"
                              className="form-check-input"
                              value="m"
                              onChange={validation.handleChange}
                              checked={validation.values.gender === "m"}
                            />
                            <Label className="form-check-label" htmlFor="Male">
                              Male
                            </Label>
                          </div>
                        </Col>
                        <Col xs={{ offset: 1, size: 3 }}>
                          <div className="form-check">
                            <Input
                              type="radio"
                              name="gender"
                              id="Female"
                              className="form-check-input"
                              value="f"
                              onChange={validation.handleChange}
                              checked={validation.values.gender === "f"}
                            />
                            <Label
                              className="form-check-label"
                              htmlFor="gender"
                            >
                              Female
                            </Label>
                          </div>
                        </Col>
                      </Row>
                    </Col>
                  </Row>

                  <Row>
                    <Col xs={12} md={4}>
                      <FormGroup>
                        <Label htmlFor="bdate">Date of Birth</Label>
                        <div className="position-relative auth-pass-inputgroup mb-3">
                          <DatePicker
                            onChange={(e) => {
                              validation.setFieldValue("bdate", e);
                            }}
                            onCalendarOpen={() =>
                              validation.setFieldTouched("bdate", true)
                            }
                            name="bdate"
                            disabled={APIWorking}
                            value={validation.values.bdate}
                            maxDate={new Date()}
                          />
                          <br />
                          {validation.errors.bdate &&
                          validation.touched.bdate ? (
                            <>
                              <div className="invalid-feedback d-block">
                                {validation.errors.bdate}
                              </div>
                            </>
                          ) : null}
                        </div>
                      </FormGroup>
                    </Col>
                    <Col md={8}>
                      <Label htmlFor="address">Address</Label>
                      <div className="position-relative auth-pass-inputgroup mb-3">
                        <Input
                          name="address"
                          className="form-control pe-5"
                          placeholder="Your address here....."
                          type="text"
                          onBlur={validation.handleBlur}
                          onChange={validation.handleChange}
                          invalid={
                            validation.touched.address &&
                            validation.errors.address
                              ? true
                              : false
                          }
                        />
                        {validation.touched.address &&
                        validation.errors.address ? (
                          <FormFeedback type="invalid">
                            {validation.errors.address}
                          </FormFeedback>
                        ) : null}
                      </div>
                    </Col>
                  </Row>

                  <div className="mt-2">
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
              <Row className="mt-2">
                <Col className="text-center">
                  <Button
                    className="btn-link text-info"
                    onClick={() => setisLogin(true)}
                  >
                    Click here to Login
                  </Button>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </>
    );
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
            {isLogin ? <Login /> : <Register />}
          </Row>
        </Container>
      </div>
    </>
  );
}

export default SignInBasic;
