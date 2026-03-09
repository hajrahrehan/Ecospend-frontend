import React, { useState } from "react";
import { Button, Modal, ModalBody } from "reactstrap";
import { toast } from "react-toastify";
import * as ApiManager from "../../helpers/ApiManager.tsx";

const CloseAccountModal = ({ ModalRef, Reset }) => {
  const [APIWorking, setAPIWorking] = useState(false);

  const [show, setshow] = useState(false);
  const [data, setdata] = useState(null);

  if (ModalRef)
    ModalRef.current = (e, f) => {
      setshow(e);
      setdata(f);
    };

  const CloseModal = () => {
    if (APIWorking) return;
    setshow(false);
  };
  return (
    <Modal isOpen={show} toggle={CloseModal}>
      <ModalBody className="py-3 px-5">
        <div className="mt-2 text-center">
          <lord-icon
            src="https://cdn.lordicon.com/gsqxdxog.json"
            trigger="loop"
            colors="primary:#f7b84b,secondary:#f06548"
            style={{ width: "100px", height: "100px" }}
          ></lord-icon>
          <div className="mt-4 pt-2 fs-15 mx-4 mx-sm-5">
            <h4>Are you sure ?</h4>
            <p className="text-muted mx-4 mb-0">
              Are you sure you want to close this account?
            </p>
          </div>
        </div>
        <div className="d-flex gap-2 justify-content-center mt-4 mb-2">
          {APIWorking ? (
            <Button className="btn-success">closing....</Button>
          ) : (
            <>
              <button
                type="button"
                className="btn w-sm btn-light"
                data-bs-dismiss="modal"
                onClick={() => {
                  if (!APIWorking) CloseModal();
                }}
              >
                Close
              </button>
              <button
                type="button"
                className="btn w-sm btn-danger "
                id="delete-record"
                onClick={async () => {
                  try {
                    if (APIWorking) return;
                    setAPIWorking(true);
                    const res = await ApiManager.AdminCloseAccount(data);
                    if (res) {
                      toast.success(`Account closed`);
                      Reset();
                    }
                    setAPIWorking(false);
                  } catch (e) {
                    setAPIWorking(false);
                    toast.error(`${e.message}`);
                  }
                }}
              >
                Yes, Close it!
              </button>
            </>
          )}
        </div>
      </ModalBody>
    </Modal>
  );
};

export default CloseAccountModal;
