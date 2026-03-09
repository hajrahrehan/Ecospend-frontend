import React, { useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Button,
  Input,
  Label,
  Form,
  FormFeedback,
} from "reactstrap";

// Formik validation
import * as Yup from "yup";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import * as ApiManager from "helpers/ApiManager.tsx";

function BeneficiaryModal({ ModalRef, Reset }) {
  const [OpenModal, setOpenModal] = useState(false);
  const [APIWorking, setAPIWorking] = useState(false);

  ModalRef.current = (e) => setOpenModal(e);

  const validation = useFormik({
    enableReinitialize: true,

    initialValues: {
      nickname: "",
      account_no: "",
      bank: "",
    },
    validationSchema: Yup.object({
      nickname: Yup.string().required("Please Enter Nickname"),
      account_no: Yup.string().required("Please Enter Account Number"),
      bank: Yup.string().required("Please Enter Bank"),
    }),
    onSubmit: async (values) => {
      try {
        if (APIWorking) return;
        setAPIWorking(true);
        const res = await ApiManager.AddBeneficiary(values);
        if (res) {
          toast.success(`Beneficiary added`);
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
          Add Beneficiary
        </h5>
      </ModalHeader>
      <ModalBody className="p-5 pt-4">
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            validation.handleSubmit();
            return false;
          }}
          action="#"
        >
          <div className="mb-3">
            <Label className="form-label" htmlFor="nickname">
              Nickname
            </Label>
            <div className="position-relative auth-pass-inputgroup mb-3">
              <Input
                name="nickname"
                className="form-control pe-5"
                placeholder="Abcd Xyz"
                value={validation.values.nickname || ""}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                invalid={
                  validation.touched.nickname && validation.errors.nickname
                    ? true
                    : false
                }
              />
              {validation.touched.nickname && validation.errors.nickname ? (
                <FormFeedback type="invalid">
                  {validation.errors.nickname}
                </FormFeedback>
              ) : null}
            </div>
          </div>

          <div className="mb-3">
            <Label className="form-label" htmlFor="account_no">
              Account No
            </Label>
            <div className="position-relative auth-pass-inputgroup mb-3">
              <Input
                name="account_no"
                className="form-control pe-5"
                placeholder="XXXXXXXXXXXXXXXXXXXX"
                maxLength={13}
                value={validation.values.account_no || ""}
                onChange={(e) => {
                  let text = e.target.value.replace(/\D/g, "");
                  validation.setFieldValue("account_no", text);
                }}
                onBlur={validation.handleBlur}
                invalid={
                  validation.touched.account_no && validation.errors.account_no
                    ? true
                    : false
                }
              />
              {validation.touched.account_no && validation.errors.account_no ? (
                <FormFeedback type="invalid">
                  {validation.errors.account_no}
                </FormFeedback>
              ) : null}
            </div>
          </div>

          <div className="mb-3">
            <Label className="form-label" htmlFor="bank">
              Bank
            </Label>
            <div className="position-relative auth-pass-inputgroup mb-3">
              <Input
                name="bank"
                className="form-control pe-5"
                placeholder="HelloBank"
                value={validation.values.bank || ""}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                invalid={
                  validation.touched.bank && validation.errors.bank
                    ? true
                    : false
                }
              />
              {validation.touched.bank && validation.errors.bank ? (
                <FormFeedback type="invalid">
                  {validation.errors.bank}
                </FormFeedback>
              ) : null}
            </div>
          </div>

          <div className="mt-4">
            <Button
              className={`btn btn-${APIWorking ? "success" : "danger"} w-100`}
              type="submit"
            >
              {APIWorking ? <>Working...</> : <>Add Beneficiary</>}
            </Button>
          </div>
        </Form>
      </ModalBody>
    </Modal>
  );
}

export default BeneficiaryModal;
