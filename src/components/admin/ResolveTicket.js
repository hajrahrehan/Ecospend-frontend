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

function ResolveTicket({ ModalRef, Reset }) {
  const [OpenModal, setOpenModal] = useState(false);
  const [APIWorking, setAPIWorking] = useState(false);
  const [ticketId, setticketId] = useState(null);

  ModalRef.current = (e, id) => {
    setOpenModal(e);
    setticketId(id);
  };

  const validation = useFormik({
    enableReinitialize: true,

    initialValues: {
      id: ticketId,
      reply: "",
    },
    validationSchema: Yup.object({
      reply: Yup.string().required("Please enter your reply"),
    }),
    onSubmit: async (values) => {
      try {
        if (APIWorking) return;

        setAPIWorking(true);
        const res = await ApiManager.AdminResolveTicket(values);
        if (res) {
          toast.success(`Ticket resolved`);
          Reset();
        }
        setAPIWorking(false);
      } catch (e) {
        setAPIWorking(false);
        toast.error(`${e.reply}`);
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
          Resolve Ticket
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
            <Label className="form-label" htmlFor="reply">
              reply
            </Label>
            <div className="position-relative auth-pass-inputgroup mb-2">
              <Input
                name="reply"
                className="form-control pl-2"
                placeholder="Enter your reply here...."
                type="textarea"
                value={validation.values.reply || ""}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                invalid={
                  validation.touched.reply && validation.errors.reply
                    ? true
                    : false
                }
              />
              {validation.touched.reply && validation.errors.reply ? (
                <FormFeedback type="invalid">
                  {validation.errors.reply}
                </FormFeedback>
              ) : null}
            </div>
          </div>

          <div className="mt-4">
            <Button
              className={`btn btn-${APIWorking ? "success" : "danger"} w-100`}
              type="submit"
            >
              {APIWorking ? <>Working...</> : <>Resolve</>}
            </Button>
          </div>
        </Form>
      </ModalBody>
    </Modal>
  );
}

export default ResolveTicket;
