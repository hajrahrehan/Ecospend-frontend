import React, { useState, useEffect } from "react";

import {
  Card,
  CardHeader,
  CardTitle,
  Row,
  Col,
  CardBody,
  Table,
  Alert,
} from "reactstrap";
import Loader from "components/common/Loader";
import * as ApiManager from "../helpers/ApiManager.tsx";
import { FormatNumber } from "helpers/utils.js";
import { Link } from "react-router-dom";
import moment from "moment";

function Dashboard(props) {
  const [MainData, setMainData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [spending, setSpending] = useState(null);

  useEffect(() => {
    let isActive = true;
    const fetchData = async () => {
      const res = await ApiManager.UserInfo();
      if (isActive && res) {
        setMainData(res.data);
      }
    };
    const fetchTransactions = async () => {
      const res = await ApiManager.GetRecentTransactions();
      if (isActive && res && res.data) {
        setTransactions(res.data);
      }
    };
    const fetchSpending = async () => {
      const res = await ApiManager.GetSpendingSummary();
      if (isActive && res && res.data) {
        setSpending(res.data);
      }
    };
    fetchData();
    fetchTransactions();
    fetchSpending();
    return () => {
      isActive = false;
    };
  }, []);

  return (
    <>
      <div className="content">
        {/* Spending Alerts */}
        {spending && spending.alerts && spending.alerts.length > 0 && (
          <Row>
            <Col>
              {spending.alerts.map((alert, i) => (
                <Alert key={i} color="warning">
                  <i className="fa fa-exclamation-triangle" />{" "}
                  {alert}
                </Alert>
              ))}
            </Col>
          </Row>
        )}

        {/* Savings Tips */}
        {spending && spending.tips && spending.tips.length > 0 && (
          <Row>
            <Col>
              {spending.tips.map((tip, i) => (
                <Alert key={i} color="info">
                  <i className="fa fa-lightbulb" />{" "}
                  {tip}
                </Alert>
              ))}
            </Col>
          </Row>
        )}

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

                  {/* Spending Summary */}
                  {spending && (
                    <Row className="mt-3">
                      <Col md={4} className="text-center">
                        <small>This Month Total</small>
                        <h5>Rs. {FormatNumber(spending.currentMonth.total)}</h5>
                      </Col>
                      <Col md={4} className="text-center">
                        <small>Transfers</small>
                        <h5>
                          Rs. {FormatNumber(spending.currentMonth.transfers)}
                        </h5>
                      </Col>
                      <Col md={4} className="text-center">
                        <small>Purchases</small>
                        <h5>
                          Rs. {FormatNumber(spending.currentMonth.purchases)}
                        </h5>
                      </Col>
                    </Row>
                  )}

                  <Row className="mt-3">
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

        {/* Recent Transactions */}
        <Row>
          <Col>
            <Card>
              <CardHeader>
                <CardTitle tag="h4">Recent Transactions</CardTitle>
              </CardHeader>
              <CardBody>
                {transactions.length === 0 ? (
                  <p className="text-center" style={{ color: "#999" }}>
                    No transactions yet
                  </p>
                ) : (
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Date</th>
                        <th>Name</th>
                        <th>Credit</th>
                        <th>Debit</th>
                        <th>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((t, i) => (
                        <tr key={t.tid}>
                          <td>{i + 1}</td>
                          <td>{moment(t.time).format("DD MMM YYYY, hh:mm A")}</td>
                          <td>{t.name}</td>
                          <td style={{ color: "#2dce89" }}>
                            {t.credit > 0
                              ? `Rs. ${FormatNumber(t.credit)}`
                              : "-"}
                          </td>
                          <td style={{ color: "#f5365c" }}>
                            {t.debit > 0
                              ? `Rs. ${FormatNumber(t.debit)}`
                              : "-"}
                          </td>
                          <td style={{ textTransform: "capitalize" }}>
                            {t.type}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default Dashboard;
