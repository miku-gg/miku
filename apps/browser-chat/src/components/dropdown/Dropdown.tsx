import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import * as MikuCore from "@mikugg/core";

const classNames = (...classes: any) => {
  return classes.filter(Boolean).join(" ");
};

interface dropDownProps {
  handleChange: Function;
  currentChatValue: number;
}

export const DropDown = ({ handleChange, currentChatValue }: dropDownProps) => {
  return (
    <Menu as="div" className="flex flex-col-reverse z-10 text-left w-3/12">
      <div>
        <Menu.Button className="inline-flex w-full justify-center button-transparent px-4 py-2 text-sm font-medium">
          {MikuCore.Commands.CommandType.DIALOG === currentChatValue ? 'Dialog' : 'Context'}
          <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className=" text-white rounded-md">
          <div className="rounded-lg overflow-hidden bg-[#0e0c20]">
            <Menu.Item>
              {({ active }) => (
                <a
                  href="#"
                  className={classNames(
                    currentChatValue === MikuCore.Commands.CommandType.DIALOG
                      ? "bg-violet-800"
                      : "",
                    "block px-4 py-2 text-sm"
                  )}
                  onClick={() =>
                    handleChange(MikuCore.Commands.CommandType.DIALOG)
                  }
                >
                  Dialog
                </a>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <a
                  href="#"
                  className={classNames(
                    currentChatValue === MikuCore.Commands.CommandType.CONTEXT
                      ? "bg-violet-800"
                      : "",
                    "block px-4 py-2 text-sm"
                  )}
                  onClick={() =>
                    handleChange(MikuCore.Commands.CommandType.CONTEXT)
                  }
                >
                  Context
                </a>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};
