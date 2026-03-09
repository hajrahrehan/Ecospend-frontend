import React, { useEffect, useState } from "react";

import {
  Card,
  CardBody,
  Table,
  Row,
  Col,
  FormGroup,
  CardHeader,
  Input,
  CardTitle,
} from "reactstrap";

import * as ApiManager from "../helpers/ApiManager.tsx";
import Loader from "components/common/Loader.js";
const moment = require("moment");

function Cards() {
  const [logData, setlogData] = useState([]);
  const [filteredData, setfilteredData] = useState([]);

  useEffect(() => {
    let isActive = true;
    const fetchData = async () => {
      const res = await ApiManager.UserCards();
      if (isActive && res) {
        setlogData(res.data);
        setfilteredData(res.data);
      }
    };

    if (logData === null) fetchData();
    return () => {
      isActive = false;
    };
  });

  const handleSearch = (text) => {
    text = text.toLowerCase();
    if (text === "") setfilteredData(logData);
    else {
      setfilteredData(
        logData.filter((x) => {
          return (
            x.cardnumber.toLowerCase().indexOf(text) !== -1 ||
            x.type.toLowerCase().indexOf(text) !== -1
          );
        }),
      );
    }
  };

  return (
    <>
      <div className="content">
        <Row>
          <Col>
            {logData === null ? (
              <>
                <Loader />
              </>
            ) : (
              <>
                <Card>
                  <CardBody>
                    <CardHeader>
                      <CardTitle tag="h3">Cards List</CardTitle>
                      <FormGroup>
                        <Row className="align-items-center">
                          <Col xs={8}>
                            <Input
                              placeholder="Search"
                              type="text"
                              onChange={(e) => {
                                handleSearch(e.target.value);
                              }}
                            />
                          </Col>
                          <Col xs={4}></Col>
                        </Row>
                      </FormGroup>
                    </CardHeader>
                    <Table className="tablesorter" responsive>
                      <thead className="text-primary">
                        <tr>
                          <th>Card Number</th>
                          <th>CVC</th>
                          <th>Expiration</th>
                          <th>Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map((card, i) => (
                          <tr key={i}>
                            <td>{card.cardnumber}</td>
                            <td>{card.cvc}</td>
                            <td>{moment(card.expiration).format("MM/YYYY")}</td>
                            <td>{card.type}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </CardBody>
                </Card>
              </>
            )}
          </Col>
        </Row>
      </div>
    </>
  );
}

export default Cards;
