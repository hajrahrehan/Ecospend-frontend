import React, { useState, useEffect, useRef } from "react";

import {
  Card,
  Form,
  Row,
  Col,
  CardBody,
  FormGroup,
  Input,
  CardHeader,
  CardTitle,
  Button,
} from "reactstrap";
import Loader from "components/common/Loader";
import * as ApiManager from "../helpers/ApiManager.tsx";

import moment from "moment";
import { toast } from "react-toastify";

function PersonalInfo(props) {
  const [MainData, setMainData] = useState(null);
  const [APIWorking, setAPIWorking] = useState(null);

  useEffect(() => {
    let isActive = true;
    const fetchData = async () => {
      const res = await ApiManager.UserInfo();
      if (isActive && res) {
        setMainData(res.data);
      }
    };
    if (MainData === null) fetchData();
    return () => {
      isActive = false;
    };
  });

  const EmailRef = useRef("");
  const PassRef = useRef("");

  const updateEmail = async () => {
    try {
      if (APIWorking) return;
      setAPIWorking(true);
      const res = await ApiManager.UpdateEmail({
        email: EmailRef.current,
      });
      if (res) {
        toast.success("Email updated");
        setMainData(null);
      }
      setAPIWorking(false);
    } catch (e) {
      toast.error(`Error ${e.message}`);
    }
  };

  const updatePassword = async () => {
    try {
      if (APIWorking) return;
      setAPIWorking(true);
      const res = await ApiManager.UpdatePassword({
        password: PassRef.current,
      });
      if (res) {
        toast.success("password updated");
        setMainData(null);
      }
      setAPIWorking(false);
    } catch (e) {
      toast.error(`Error ${e.message}`);
    }
  };

  return (
    <>
      <div className="content">
        <Row>
          <Col>
            {MainData === null ? (
              <Loader />
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle tag={"h3"}>Personal Details</CardTitle>
                  </CardHeader>
                  <CardBody>
                    <Form>
                      <Row>
                        <Col className="pr-md-1">
                          <FormGroup>
                            <label>First name</label>
                            <Input
                              className="form-control pe-5"
                              defaultValue={MainData.user.fname}
                              disabled
                            />
                          </FormGroup>
                        </Col>
                        <Col className="pr-md-1">
                          <FormGroup>
                            <label>Last name</label>
                            <Input
                              className="form-control pe-5"
                              defaultValue={MainData.user.lname}
                              disabled
                            />
                          </FormGroup>
                        </Col>
                        <Col className="pr-md-1">
                          <FormGroup>
                            <label>CNIC</label>
                            <Input
                              className="form-control pe-5"
                              defaultValue={MainData.user.cnic}
                              disabled
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row>
                        <Col className="pr-md-1">
                          <FormGroup>
                            <label>Gender</label>
                            <Input
                              className="form-control pe-5"
                              defaultValue={
                                MainData.user.gender === "m" ? "Male" : "Female"
                              }
                              disabled
                            />
                          </FormGroup>
                        </Col>
                        <Col className="pr-md-1">
                          <FormGroup>
                            <label>DOB</label>
                            <Input
                              className="form-control pe-5"
                              defaultValue={moment(MainData.user.bdate).format(
                                "DD MMM YYY",
                              )}
                              disabled
                            />
                          </FormGroup>
                        </Col>
                        <Col className="pr-md-1">
                          <FormGroup>
                            <label>Account Number</label>
                            <Input
                              className="form-control pe-5"
                              defaultValue={MainData.user.account_no}
                              disabled
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row className="align-items-center">
                        <Col className="pr-md-1" md={4}>
                          <FormGroup>
                            <label>Email</label>
                            <Input
                              className="form-control pe-5"
                              defaultValue={MainData.user.email}
                              disabled
                            />
                          </FormGroup>
                        </Col>
                        <Col className="pr-md-1">
                          <FormGroup>
                            <label>Address</label>
                            <Input
                              className="form-control pe-5"
                              defaultValue={MainData.user.address}
                              disabled
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                    </Form>
                  </CardBody>
                </Card>
                <Row>
                  <Col>
                    <Card>
                      <CardHeader>
                        <CardTitle tag={"h4"}>Change Email</CardTitle>
                      </CardHeader>
                      <CardBody className="text-center pl-5 pr-5">
                        <Input
                          placeholder="email@domain.com"
                          type="email"
                          onChange={(e) => (EmailRef.current = e.target.value)}
                        />
                        <Button
                          className="mt-4"
                          onClick={updateEmail}
                          disabled={APIWorking}
                        >
                          {!APIWorking ? "Update Email" : "Working..."}
                        </Button>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col>
                    <Card>
                      <CardHeader>
                        <CardTitle tag={"h4"}>Change Password</CardTitle>
                      </CardHeader>
                      <CardBody className="text-center pl-5 pr-5">
                        <Input
                          placeholder="* * * * * * *"
                          type="password"
                          onChange={(e) => (PassRef.current = e.target.value)}
                        />
                        <Button
                          className="mt-4"
                          onClick={updatePassword}
                          disabled={APIWorking}
                        >
                          {!APIWorking ? "Update password" : "Working..."}
                        </Button>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
              </>
            )}
          </Col>
        </Row>
      </div>
    </>
  );
}

export default PersonalInfo;
