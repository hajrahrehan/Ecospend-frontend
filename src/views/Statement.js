import React, { useState } from "react";

import {
  Card,
  CardBody,
  Table,
  Row,
  Col,
  CardHeader,
  CardTitle,
  Button,
} from "reactstrap";
import DatePicker from "react-date-picker";

import * as ApiManager from "../helpers/ApiManager.tsx";
import Loader from "components/common/Loader.js";
import moment from "moment";
import { toast } from "react-toastify";
import { FormatNumber } from "helpers/utils.js";

function Statement() {
  const [MainData, setMainData] = useState(null);

  const [startDate, setstartDate] = useState(null);
  const [endDate, setendDate] = useState(null);
  const [APIWorking, setAPIWorking] = useState(false);

  const GenerateStatement = async () => {
    try {
      if (APIWorking) return;
      setAPIWorking(true);
      const res = await ApiManager.GetStatement({
        start: moment(startDate).format("YYYY-MM-DD"),
        end: endDate ? moment(endDate).format("YYYY-MM-DD") : null,
      });
      if (res) {
        setMainData(res.data);
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
            <Card>
              <CardHeader>
                <CardTitle tag="h3">Generate Statement</CardTitle>
              </CardHeader>
              <CardBody>
                <Row className="align-items-center">
                  <Col>
                    Start Date:{"  "}
                    <DatePicker
                      onChange={(e) => {
                        setstartDate(e);
                        setendDate(null);
                      }}
                      disabled={APIWorking}
                      value={startDate}
                      maxDate={new Date()}
                    />
                  </Col>
                  <Col>
                    End Date:{"  "}
                    <DatePicker
                      onChange={setendDate}
                      value={endDate}
                      disabled={APIWorking || startDate === null}
                      minDate={startDate}
                      maxDate={new Date()}
                    />
                  </Col>
                  <Col className="text-center">
                    <Button
                      color="info"
                      disabled={APIWorking || startDate === null}
                      onClick={GenerateStatement}
                    >
                      Generate
                    </Button>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col>
            {APIWorking ? (
              <>
                <Loader />
              </>
            ) : MainData === null ? (
              <></>
            ) : (
              <>
                <Card>
                  <CardBody>
                    <CardHeader>
                      <CardTitle tag="h3">Statement</CardTitle>
                    </CardHeader>
                    <Table className="tablesorter" responsive>
                      <thead className="text-primary">
                        <tr>
                          <th>#</th>
                          <th>Time</th>
                          <th>Name</th>
                          <th>Credit</th>
                          <th>Debit</th>
                          <th>type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {MainData.map((item, i) => (
                          <tr key={i}>
                            <td>{i + 1}</td>
                            <td>
                              {moment(item.time).format(
                                "DD MMM YYYY[, ]h:mm A",
                              )}
                            </td>
                            <td>{item.name}</td>
                            <td>{item.credit}</td>
                            <td>{item.debit}</td>
                            <td>{item.type}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </CardBody>
                </Card>
                <Row>
                  <Col>
                    <Card className="card-chart">
                      <CardHeader>
                        <h5 className="card-category">Total Transactions</h5>
                        <CardTitle tag="h3">
                          <i className="tim-icons icon-notes text-info" />{" "}
                          {MainData.length}
                        </CardTitle>
                      </CardHeader>
                    </Card>
                  </Col>
                  <Col>
                    <Card className="card-chart">
                      <CardHeader>
                        <h5 className="card-category">Total Debit</h5>
                        <CardTitle tag="h3">
                          <i className="tim-icons icon-upload text-info" />{" "}
                          {FormatNumber(
                            MainData.reduce((p, n) => p + n.debit, 0),
                          )}
                        </CardTitle>
                      </CardHeader>
                    </Card>
                  </Col>
                  <Col>
                    <Card className="card-chart">
                      <CardHeader>
                        <h5 className="card-category">Total Credit</h5>
                        <CardTitle tag="h3">
                          <i className="tim-icons icon-money-coins text-info" />{" "}
                          {FormatNumber(
                            MainData.reduce((p, n) => p + n.credit, 0),
                          )}
                        </CardTitle>
                      </CardHeader>
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

export default Statement;
