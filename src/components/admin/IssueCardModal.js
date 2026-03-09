import React, { useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Button,
  Input,
  Label,
  Form,
  Row,
  Col,
} from "reactstrap";

// Formik validation
import * as Yup from "yup";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import * as ApiManager from "helpers/ApiManager.tsx";

function IssueCardModal({ ModalRef, Reset }) {
  const [OpenModal, setOpenModal] = useState(false);
  const [APIWorking, setAPIWorking] = useState(false);
  const [cid, setcid] = useState(null);

  ModalRef.current = (e, id, type) => {
    setOpenModal(e);
    setcid(id);
  };

  const validation = useFormik({
    enableReinitialize: true,

    initialValues: {
      type: "Silver",
    },
    validationSchema: Yup.object({
      type: Yup.string().required("Please select card type"),
    }),
    onSubmit: async (values) => {
      try {
        if (APIWorking) return;

        setAPIWorking(true);
        const res = await ApiManager.AdminIssueCard(cid, values);
        if (res) {
          toast.success(`Card issued`);
          Reset();
        }
        setAPIWorking(false);
      } catch (e) {
        setAPIWorking(false);
        toast.error(`${e.message}`);
      }
    },
  });

  return (
    <Modal
      isOpen={OpenModal}
      toggle={() => {
        if (!APIWorking) {
          setOpenModal(false);
        }
      }}
      id="infomodal"
      size="lg"
      style={{ maxWidth: "700px", width: "100%" }}
    >
      <ModalHeader className="d-flex flex-row">
        <h5 className="modal-title" id="exampleModalToggleLabel2">
          Issue new card
        </h5>
      </ModalHeader>
      <ModalBody className="p-5">
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            validation.handleSubmit();
            return false;
          }}
          action="#"
        >
          <div className="mb-3">
            <Row>
              <Col>
                <div className="form-check">
                  <Input
                    type="radio"
                    name="type"
                    id="Silver"
                    className="form-check-input"
                    value="Silver"
                    onChange={validation.handleChange}
                    checked={validation.values.type === "Silver"}
                  />
                  <Label className="form-check-label" htmlFor="Silver">
                    Silver
                  </Label>
                </div>
              </Col>
              <Col>
                <div className="form-check">
                  <Input
                    type="radio"
                    name="type"
                    id="Gold"
                    className="form-check-input"
                    value="Gold"
                    onChange={validation.handleChange}
                    checked={validation.values.type === "Gold"}
                  />
                  <Label className="form-check-label" htmlFor="Gold">
                    Gold
                  </Label>
                </div>
              </Col>
              <Col>
                <div
                  className="form-check"
                  style={{
                    marginLeft: "40px",
                  }}
                >
                  <Input
                    type="radio"
                    name="type"
                    id="Platinum"
                    className="form-check-input"
                    value="Platinum"
                    onChange={validation.handleChange}
                    checked={validation.values.type === "Platinum"}
                  />
                  <Label className="form-check-label" htmlFor="Platinum">
                    Platinum
                  </Label>
                </div>
              </Col>
            </Row>
          </div>

          <div className="mt-4">
            <Button
              className={`btn btn-${APIWorking ? "success" : "danger"} w-100`}
              type="submit"
            >
              {APIWorking ? <>Working...</> : <>Issue</>}
            </Button>
          </div>
        </Form>
      </ModalBody>
    </Modal>
  );
}

export default IssueCardModal;
