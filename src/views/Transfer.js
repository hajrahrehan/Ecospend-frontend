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
  Form,
} from "reactstrap";

import * as ApiManager from "../helpers/ApiManager.tsx";
import Loader from "components/common/Loader.js";
import { toast } from "react-toastify";
import { FormatNumber } from "helpers/utils.js";
function Transfer() {
  const [logData, setlogData] = useState(null);
  const [filteredData, setfilteredData] = useState([]);

  const [selected, setselected] = useState(null);
  const [APIWorking, setAPIWorking] = useState(false);

  useEffect(() => {
    let isActive = true;
    const fetchData = async () => {
      const res = await ApiManager.BeneficiaryList();
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
            x.nickname.toLowerCase().indexOf(text) !== -1 ||
            x.account_no.toLowerCase().indexOf(text) !== -1 ||
            x.bank.toLowerCase().indexOf(text) !== -1 ||
            x.name.toLowerCase().indexOf(text) !== -1
          );
        }),
      );
    }
  };

  const AmountRef = useRef();
  const handleTransfer = async () => {
    try {
      if (APIWorking) return;
      AmountRef.current = AmountRef.current.replace(/\D/g, "");
      if (AmountRef.current === "") {
        return toast.error("Input some value");
      } else if (isNaN(AmountRef.current)) {
        return toast.error("Input only Numbers");
      } else if (parseInt(AmountRef.current) < 10) {
        return toast.error("You need to transfer atleast Rs. 10");
      } else {
        setAPIWorking(true);
        const res = await ApiManager.TransferToBeneficiary(selected._id, {
          amount: parseInt(AmountRef.current),
        });
        if (res) {
          toast.success(
            `Transferred Rs. ${FormatNumber(+AmountRef.current)} to ${
              selected.nickname
            }`,
          );
          setselected(null);
          setlogData(null);
        }

        setAPIWorking(false);
      }
    } catch (e) {
      toast.error(`Error ${e.message}`);
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
            ) : selected === null ? (
              <>
                <Card>
                  <CardBody>
                    <CardHeader>
                      <CardTitle tag="h3">Beneficiary List</CardTitle>
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
                        </Row>
                      </FormGroup>
                    </CardHeader>
                    <Table className="tablesorter" responsive>
                      <thead className="text-primary">
                        <tr>
                          <th>Nickname</th>
                          <th>Name</th>
                          <th>Account No</th>
                          <th>Bank</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map((user, i) => (
                          <tr key={i}>
                            <td>{user.nickname}</td>
                            <td>{user.name}</td>
                            <td>{user.account_no}</td>
                            <td>{user.bank}</td>
                            <td colSpan={1}>
                              <Button
                                className="btn-danger   "
                                onClick={() => setselected(user)}
                              >
                                Transfer
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </CardBody>
                </Card>
              </>
            ) : (
              <Card>
                <CardBody>
                  <Form>
                    <Row>
                      <Col className="pr-md-1">
                        <FormGroup>
                          <label>Name</label>
                          <Input
                            defaultValue={selected.name}
                            disabled
                            type="text"
                          />
                        </FormGroup>
                      </Col>
                      <Col className="px-md-1">
                        <FormGroup>
                          <label>Account No</label>
                          <Input
                            defaultValue={selected.account_no}
                            disabled
                            type="text"
                          />
                        </FormGroup>
                      </Col>
                      <Col className="pl-md-1">
                        <FormGroup>
                          <label>Bank</label>
                          <Input
                            disabled
                            defaultValue={selected.bank}
                            type="email"
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                  </Form>
                  <Row>
                    <Col>
                      <FormGroup>
                        <label>Transfer Money</label>
                        <Input
                          placeholder="100000"
                          type="tet"
                          onChange={(e) => {
                            AmountRef.current = e.target.value;
                          }}
                        />
                      </FormGroup>
                      <Button
                        className="btn-fill"
                        color="info"
                        onClick={(e) => {
                          handleTransfer();
                          e.preventDefault();
                        }}
                        //                          disabled={APIWorking}
                      >
                        {APIWorking ? "Running" : "Add"}
                      </Button>
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

export default Transfer;
