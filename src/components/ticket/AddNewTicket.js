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

function TicketModal({ ModalRef, Reset }) {
  const [OpenModal, setOpenModal] = useState(false);
  const [APIWorking, setAPIWorking] = useState(false);

  // Allow parent to open/close modal via ref
  // ensure ModalRef exists before assigning
  if (ModalRef) ModalRef.current = (e) => setOpenModal(e);

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      subject: "",
      message: "",
    },
    validationSchema: Yup.object({
      subject: Yup.string()
        .required("Please enter a subject")
        .min(3, "Subject should be at least 3 characters."),
      message: Yup.string()
        .required("Please enter your message")
        .min(20, "Your message should contain at least 20 characters."),
    }),
    onSubmit: async (values) => {
      try {
        if (APIWorking) return;

        setAPIWorking(true);
        // Send both subject and message
        const res = await ApiManager.CreateTicket(values);

        if (res && res.status && res.status === "success") {
          toast.success(`Ticket created`);
          // close modal and reset form
          setOpenModal(false);
          validation.resetForm();
          if (Reset) Reset(); // parent will re-fetch
        } else {
          // if backend returns error payload not throwing
          const msg =
            (res && res.message) || "Something went wrong. Please try again.";
          toast.error(msg);
        }
        setAPIWorking(false);
      } catch (e) {
        setAPIWorking(false);
        toast.error(`${e.message || "Request failed."}`);
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
          Add Ticket
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
            <Label className="form-label" htmlFor="subject">
              Subject
            </Label>
            <Input
              name="subject"
              placeholder="Short subject (e.g. Card not working)"
              value={validation.values.subject}
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              invalid={
                validation.touched.subject && validation.errors.subject
                  ? true
                  : false
              }
            />
            {validation.touched.subject && validation.errors.subject ? (
              <FormFeedback>{validation.errors.subject}</FormFeedback>
            ) : null}
          </div>

          <div className="mb-3">
            <Label className="form-label" htmlFor="message">
              Message
            </Label>
            <div className="position-relative auth-pass-inputgroup mb-2">
              <Input
                name="message"
                className="form-control pl-2"
                placeholder="Enter your message here...."
                type="textarea"
                value={validation.values.message || ""}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                invalid={
                  validation.touched.message && validation.errors.message
                    ? true
                    : false
                }
              />
              {validation.touched.message && validation.errors.message ? (
                <FormFeedback type="invalid">
                  {validation.errors.message}
                </FormFeedback>
              ) : null}
            </div>
          </div>

          <div className="mt-4">
            <Button
              className={`btn btn-${APIWorking ? "success" : "danger"} w-100`}
              type="submit"
              disabled={APIWorking}
            >
              {APIWorking ? <>Working...</> : <>Submit</>}
            </Button>
          </div>
        </Form>
      </ModalBody>
    </Modal>
  );
}

export default TicketModal;
