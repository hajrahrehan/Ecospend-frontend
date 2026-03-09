import React, { useEffect, useRef, useState } from "react";

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
  Button,
  Badge,
} from "reactstrap";

import * as ApiManager from "../helpers/ApiManager.tsx";
import Loader from "components/common/Loader.js";
import AddNewTicket from "components/ticket/AddNewTicket.js";

function Beneficiary() {
  const [logData, setlogData] = useState(null);
  const [filteredData, setfilteredData] = useState([]);

  useEffect(() => {
    let isActive = true;
    const fetchData = async () => {
      const res = await ApiManager.UserTicketList();
      if (isActive && res) {
        setlogData(res.data.reverse());
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
            x.status.toLowerCase().indexOf(text) !== -1 ||
            x.message.toLowerCase().indexOf(text) !== -1 
          );
        }),
      );
    }
  };

  const ModalRef = useRef();

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
                <AddNewTicket
                  Reset={() => setlogData(null)}
                  ModalRef={ModalRef}
                />
                <Card>
                  <CardBody>
                    <CardHeader>
                      <CardTitle tag="h3">Tickets List</CardTitle>
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
                          <Col xs={4}>
                            <Button onClick={() => ModalRef.current(true)}>
                              Add new ticket
                            </Button>
                          </Col>
                        </Row>
                      </FormGroup>
                    </CardHeader>
                    <Table className="tablesorter" responsive>
                      <thead className="text-primary">
                        <tr>
                          <th>Message</th>
                          <th>Admin Reply</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map((user, i) => (
                          <tr key={i}>
                            <td>{user.message}</td>
                            <td>{user.reply || "N/A"}</td>
                            <td>
                              <Badge
                                color={
                                  user.status === "active"
                                    ? "primary"
                                    : "secondary"
                                }
                              >
                                {user.status}
                              </Badge>
                            </td>
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

export default Beneficiary;
