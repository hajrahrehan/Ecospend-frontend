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
import * as ApiManager from "../../helpers/ApiManager.tsx";

function EditBeneficiaryModal({ ModalRef, Reset }) {
  const [OpenModal, setOpenModal] = useState(false);
  const [data, setdata] = useState(null);
  const [APIWorking, setAPIWorking] = useState(false);

  ModalRef.current = (e, f) => {
    setOpenModal(e);
    setdata(f);
  };

  const validation = useFormik({
    enableReinitialize: true,

    initialValues: {
      nickname: data?.nickname || "",
    },
    validationSchema: Yup.object({
      nickname: Yup.string().required("Please Enter Nickname"),
    }),
    onSubmit: async (values) => {
      try {
        if (APIWorking) return;
        setAPIWorking(true);
        const res = await ApiManager.EditBeneficiary(data?._id,values);
        if (res) {
          toast.success(`Beneficiary updated`);
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
          Edit Beneficiary
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
                maxLength={13}
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

          <div className="mt-4">
            <Button
              className={`btn btn-${APIWorking ? "success" : "danger"} w-100`}
              type="submit"
            >
              {APIWorking ? <>Working...</> : <>Edit Beneficiary</>}
            </Button>
          </div>
        </Form>
      </ModalBody>
    </Modal>
  );
}

export default EditBeneficiaryModal;
