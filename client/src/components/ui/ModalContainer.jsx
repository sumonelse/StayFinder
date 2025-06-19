import React, { useState, useEffect, useCallback } from "react"
import Modal from "./Modal"

/**
 * ModalContainer component to manage modals globally
 */
const ModalContainer = () => {
    const [modals, setModals] = useState([])

    // Close a modal by ID
    const closeModal = useCallback((id) => {
        setModals((prevModals) => prevModals.filter((modal) => modal.id !== id))
    }, [])

    // Open a new modal
    const openModal = useCallback(
        ({ title, content, size, closeOnOverlayClick, showCloseButton }) => {
            const id = `modal-${Date.now()}-${Math.random()
                .toString(36)
                .substr(2, 9)}`
            const newModal = {
                id,
                title,
                content,
                size,
                closeOnOverlayClick,
                showCloseButton,
            }

            setModals((prevModals) => [...prevModals, newModal])

            return id
        },
        []
    )

    // Expose methods globally
    useEffect(() => {
        window.modal = {
            open: (options) => openModal(options),
            close: (id) => {
                if (id) {
                    closeModal(id)
                } else {
                    setModals([])
                }
            },
        }

        return () => {
            delete window.modal
        }
    }, [openModal, closeModal])

    return (
        <>
            {modals.map((modal) => (
                <Modal
                    key={modal.id}
                    isOpen={true}
                    onClose={() => closeModal(modal.id)}
                    title={modal.title}
                    size={modal.size || "md"}
                    closeOnOverlayClick={
                        modal.closeOnOverlayClick !== undefined
                            ? modal.closeOnOverlayClick
                            : true
                    }
                    showCloseButton={
                        modal.showCloseButton !== undefined
                            ? modal.showCloseButton
                            : true
                    }
                >
                    {typeof modal.content === "function"
                        ? modal.content({ close: () => closeModal(modal.id) })
                        : modal.content}
                </Modal>
            ))}
        </>
    )
}

export default ModalContainer
