import React, { useState, useEffect } from "react";

import { Card, CardHeader, CardTitle, Row, Col, CardBody } from "reactstrap";
import Loader from "components/common/Loader";
import * as ApiManager from "../helpers/ApiManager.tsx";
import { FormatNumber } from "helpers/utils.js";
import { Link } from "react-router-dom";

function Dashboard(props) {
  const [MainData, setMainData] = useState(null);

  useEffect(() => {
    let isActive = true;
    const fetchData = async () => {
      const res = await ApiManager.UserInfo();
      if (isActive && res) {
        setMainData(res.data);
      }
    };
    fetchData();
    return () => {
      isActive = false;
    };
  }, []);

  return (
    <>
      <div className="content">
        <Row>
          <Col>
            {MainData === null ? (
              <Loader />
            ) : (
              <Card className="card-chart">
                <CardHeader>
                  <CardTitle tag="h3">
                    Welcome {MainData.user.fname} {MainData.user.lname}!
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col className="text-center">
                      Your account balance{" "}
                      <h4>Rs. {FormatNumber(MainData.user.balance)}</h4>
                    </Col>
                    <Col className="text-center">
                      Account Number <h4>{MainData.user.account_no}</h4>
                    </Col>
                  </Row>
                  <Row>
                    <Col className="text-center">
                      <Link className="btn btn-info" to="/main/personal">
                        Personal details
                      </Link>
                      <Link className="btn btn-info" to="/main/transfer">
                        Make Transaction
                      </Link>
                      <Link className="btn btn-info" to="/main/beneficiary">
                        Beneficiary Management
                      </Link>
                      <Link className="btn btn-info" to="/main/statement">
                        Get Statement
                      </Link>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            )}
          </Col>
        </Row>
      </div>
    </>
  );
}

export default Dashboard;
