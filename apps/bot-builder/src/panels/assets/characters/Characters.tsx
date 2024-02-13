import { FaHammer } from "react-icons/fa6";
import { MdSearch } from "react-icons/md";
import config from "../../../config";
import { openModal } from "../../../state/slices/inputSlice";
import { useAppDispatch, useAppSelector } from "../../../state/store";
import "./Characters.scss";
import { Blocks } from "@mikugg/ui-kit";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { v4 as randomUUID } from "uuid";
import { createCharacter } from "../../../state/slices/novelFormSlice";

export default function Characters() {
  const characters = useAppSelector((state) => state.novel.characters);
  const dispatch = useAppDispatch();

  const handleCreateCharacter = () => {
    const id = randomUUID();
    dispatch(createCharacter(id));
    dispatch(openModal({ modalType: "character", editId: id }));
  };

  return (
    <div className="Characters group">
      <div className="title-small">Characters</div>
      <div className="Characters__list">
        <Blocks
          tooltipId="characters"
          items={[
            ...characters.map((character) => ({
              id: `characters-${character.id}`,
              tooltip: character.name,
              content: {
                image: config.genAssetLink(character.profile_pic),
              },
              onClick: () =>
                dispatch(
                  openModal({
                    modalType: "character",
                    editId: character.id,
                  })
                ),
            })),
            {
              id: "create",
              content: {
                icon: <FaHammer />,
                text: "Create",
              },
              onClick: handleCreateCharacter,
            },
            {
              id: "search",
              content: {
                icon: <MdSearch />,
                text: "Search",
              },
              onClick: () =>
                dispatch(openModal({ modalType: "characterSearch" })),
            },
          ]}
        />
      </div>
    </div>
  );
}
