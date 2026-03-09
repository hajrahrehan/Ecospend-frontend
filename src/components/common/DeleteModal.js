import PropTypes from "prop-types";
import React, { useState } from "react";
import { Modal, ModalBody, Spinner } from "reactstrap";

const DeleteModal = ({ onDeleteClick, onCloseClick, text, del, ModalRef }) => {
  const [Activity, setActivity] = useState(false);

  const [show, setshow] = useState(false);

  if (ModalRef)
    ModalRef.current = {
      setActivity,
      setshow,
    };

  const CloseModal = () => {
    if (Activity) return;
    setshow(false);
    if (onCloseClick) onCloseClick();
  };
  return (
    <Modal isOpen={show} toggle={CloseModal} centered={true}>
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
              Are you sure you want to remove {text || "this record ?"}
            </p>
          </div>
        </div>
        <div className="d-flex gap-2 justify-content-center mt-4 mb-2">
          {Activity ? (
            <Spinner />
          ) : (
            <>
              <button
                type="button"
                className="btn w-sm btn-light"
                data-bs-dismiss="modal"
                onClick={() => {
                  if (!Activity) CloseModal();
                }}
              >
                Close
              </button>
              <button
                type="button"
                className="btn w-sm btn-danger "
                id="delete-record"
                onClick={() => {
                  if (!Activity) onDeleteClick();
                }}
              >
                Yes, {del || "Delete It!"}
              </button>
            </>
          )}
        </div>
      </ModalBody>
    </Modal>
  );
};

DeleteModal.propTypes = {
  onCloseClick: PropTypes.func,
  onDeleteClick: PropTypes.func,
  show: PropTypes.any,
};

export default DeleteModal;
