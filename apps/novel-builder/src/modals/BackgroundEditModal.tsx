import { AreYouSure, Button, Input, Modal } from "@mikugg/ui-kit";
import { useAppSelector } from "../state/store";
import { selectEditingBackground } from "../state/selectors";
import { useDispatch } from "react-redux";
import { closeModal } from "../state/slices/inputSlice";
import config from "../config";
import "./BackgroundEditModal.scss";
import {
  deleteBackground,
  updateBackground,
} from "../state/slices/novelFormSlice";

export default function BackgroundEditModal() {
  const background = useAppSelector(selectEditingBackground);
  const dispatch = useDispatch();
  const { openModal } = AreYouSure.useAreYouSure();

  const handleDeleteBackground = () => {
    openModal({
      title: "Are you sure?",
      description: "This action cannot be undone",
      onYes: () => {
        dispatch(closeModal({ modalType: "background" }));
        if (background) {
          dispatch(deleteBackground(background.id));
        }
      },
    });
  };

  return (
    <Modal
      opened={!!background}
      title="Edit Background"
      className="BackgroundEditModal"
      shouldCloseOnOverlayClick
      onCloseModal={() => dispatch(closeModal({ modalType: "background" }))}
    >
      {background ? (
        <div className="BackgroundEditModal_content">
          <div
            className="BackgroundEditModal__background"
            style={{
              backgroundImage: `url(${config.genAssetLink(
                background.source.jpg
              )})`,
            }}
          />
          <div>
            <Input
              label="Name"
              placeHolder="Forest"
              value={background.name}
              onChange={(e) =>
                dispatch(
                  updateBackground({ ...background, name: e.target.value })
                )
              }
            />
            <Input
              label="Description"
              placeHolder="forest at night, with trees and animals"
              value={background.description}
              onChange={(e) =>
                dispatch(
                  updateBackground({
                    ...background,
                    description: e.target.value,
                  })
                )
              }
            />
            <div className="BackgroundEditModal__attributes">
              <div className="title-small">Attributes</div>
              {background.attributes
                .filter((attr) => attr.length === 2)
                .map((attribute, index) => (
                  <div key={index} className="BackgroundEditModal__attribute">
                    <Input
                      value={attribute[0]}
                      onChange={(e) => {
                        const newAttributes = [...background.attributes];
                        newAttributes[index] = [
                          e.target.value,
                          newAttributes[index][1],
                        ];
                        dispatch(
                          updateBackground({
                            ...background,
                            attributes: newAttributes,
                          })
                        );
                      }}
                    />
                    <div>=</div>
                    <Input
                      value={attribute[1]}
                      onChange={(e) => {
                        const newAttributes = [...background.attributes];
                        newAttributes[index] = [
                          newAttributes[index][0],
                          e.target.value,
                        ];
                        dispatch(
                          updateBackground({
                            ...background,
                            attributes: newAttributes,
                          })
                        );
                      }}
                    />
                    <Button
                      theme="transparent"
                      onClick={() => {
                        const newAttributes = [...background.attributes];
                        newAttributes.splice(index, 1);
                        dispatch(
                          updateBackground({
                            ...background,
                            attributes: newAttributes,
                          })
                        );
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              <Button
                theme="secondary"
                className="BackgroundEditModal__addAttributeButton"
                onClick={() =>
                  dispatch(
                    updateBackground({
                      ...background,
                      attributes: [...background.attributes, ["", ""]],
                    })
                  )
                }
              >
                Add attribute
              </Button>
            </div>
          </div>
          <div className="BackgroundEditModal__delete">
            <Button onClick={handleDeleteBackground} theme="primary">
              Delete background
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
