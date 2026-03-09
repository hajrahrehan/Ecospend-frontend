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
  Badge,
  Button,
} from "reactstrap";

import * as ApiManager from "../../helpers/ApiManager.tsx";
import Loader from "components/common/Loader.js";
import ResolveTicket from "components/admin/ResolveTicket.js";

function Dashboard() {
  const [logData, setlogData] = useState(null);
  const [filteredData, setfilteredData] = useState([]);

  useEffect(() => {
    let isActive = true;
    const fetchData = async () => {
      const res = await ApiManager.AdminTicketList();
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
                <ResolveTicket
                  Reset={() => setlogData(null)}
                  ModalRef={ModalRef}
                />
                <Card>
                  <CardBody>
                    <CardHeader>
                      <CardTitle tag="h3">Open Tickets</CardTitle>
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
                          <th>Ticket ID</th>
                          <th>Message</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map((user, i) => (
                          <tr key={i}>
                            <td>{i+1}</td>
                            <td>{user.message}</td>
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
                            <td colSpan={1}>
                              <Button
                                className="btn-danger"
                                onClick={() => ModalRef.current(true, user._id)}
                              >
                                Resolve
                              </Button>
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

export default Dashboard;
