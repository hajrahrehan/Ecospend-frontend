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
} from "reactstrap";

import * as ApiManager from "../helpers/ApiManager.tsx";
import Loader from "components/common/Loader.js";
import AddBeneficiaryModal from "components/beneficiary/AddBeneficiaryModal.js";
import EditBeneficiaryModal from "components//beneficiary/EditBeneficiaryModal.js";
import DeleteBeneficiaryModal from "components//beneficiary/DeleteBeneficiaryModal.js";

function Beneficiary() {
  const [logData, setlogData] = useState(null);
  const [filteredData, setfilteredData] = useState([]);

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

  const ModalRef = useRef();
  const ModalRef2 = useRef();
  const ModalRef3 = useRef();

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
                <AddBeneficiaryModal
                  Reset={() => setlogData(null)}
                  ModalRef={ModalRef}
                />
                <EditBeneficiaryModal
                  Reset={() => setlogData(null)}
                  ModalRef={ModalRef2}
                />
                <DeleteBeneficiaryModal
                  ModalRef={ModalRef3}
                  Reset={() => setlogData(null)}
                />
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
                          <Col xs={4}>
                            <Button
                              onClick={() => ModalRef.current(true, null)}
                            >
                              Add new beneficiary
                            </Button>
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
                                className="btn-success"
                                onClick={() => ModalRef2.current(true, user)}
                              >
                                Edit
                              </Button>
                              <Button
                                className="ml-2 btn-danger"
                                onClick={() =>
                                  ModalRef3.current(true, user)
                                }
                              >
                                Delete
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

export default Beneficiary;
