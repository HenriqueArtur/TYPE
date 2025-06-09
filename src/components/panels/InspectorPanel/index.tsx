import {
  Accordion,
  AccordionItem,
  Button,
  Checkbox,
  Divider,
  Input,
  Listbox,
  ListboxItem,
  NumberInput,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectItem,
  Slider,
} from "@heroui/react";
import { useState } from "react";
import { Icon } from "../../utils/Icon";

export interface InspectorPanelProps {
  object_name?: string;
}

export default function InspectorPanel({ object_name = "UnnamedGameObject" }: InspectorPanelProps) {
  const [name, setName] = useState(object_name);

  return (
    <div className="h-full p-0 flex flex-col">
      <div className="bg-content2 px-2 py-1 border-b border-[#444] font-bold text-[15px] tracking-[0.5px] flex items-center justify-between gap-2">
        <Icon type="outlined" symbol="game_object" className="select-none text-[20px]!" />
        <Input
          type="text"
          variant="flat"
          isClearable={false}
          size="sm"
          maxLength={120}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="px-0 bg-content1">
        <Accordion
          isCompact
          selectionMode="multiple"
          variant="light"
          itemClasses={{
            heading: "px-2",
            trigger: "py-1",
            startContent: "flex items-center",
            content: "px-2 bg-content3 py-2",
          }}
          className="p-0! m-0!"
        >
          <AccordionItem
            key="1"
            aria-label="Transform"
            title="Transform"
            startContent={
              <Icon type="outlined" symbol="transform" className="select-none text-[20px]!" />
            }
          >
            <TransformComponentPanel />
          </AccordionItem>
          <AccordionItem
            key="2"
            aria-label="Script"
            title="Script"
            startContent={
              <Icon type="outlined" symbol="code" className="select-none text-[20px]!" />
            }
          >
            <ScriptComponentPanel />
          </AccordionItem>
        </Accordion>
      </div>
      <span className="mx-auto pt-2">
        <Popover placement="bottom" className="dark">
          <PopoverTrigger>
            <Button size="sm">Add Component</Button>
          </PopoverTrigger>
          <PopoverContent>
            <Listbox aria-label="Listbox menu with icons" variant="faded">
              <ListboxItem key="new" startContent={<Icon type="outlined" symbol="transform" />}>
                Transform
              </ListboxItem>
              <ListboxItem key="copy" startContent={<Icon type="outlined" symbol="code" />}>
                Script
              </ListboxItem>
            </Listbox>
          </PopoverContent>
        </Popover>
      </span>
    </div>
  );
}

function ScriptComponentPanel() {
  const FILES = [
    {
      name: "Player.ts",
      path: "scripts/Player.ts",
    },
    {
      name: "Camera.ts",
      path: "scripts/Camera.ts",
    },
    {
      name: "MapDraw.ts",
      path: "scripts/Map/MapDraw.ts",
    },
  ];
  const ENUM = [
    {
      name: "Player",
      value: "PLAYER",
    },
    {
      name: "Enemy",
      value: "ENEMY",
    },
  ];
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <Select
          items={FILES}
          label="File"
          labelPlacement="outside-left"
          size="sm"
          classNames={{ popoverContent: "dark dark:bg-content1! bg-content1!" }}
        >
          {(file) => (
            <SelectItem
              key={file.path}
              textValue={file.name}
              className="dark:bg-content1[100%]! bg-content1[100%]!"
            >
              <div className="flex gap-2 items-center">
                <div className="flex flex-col">
                  <span className="text-small">{file.name}</span>
                  <span className="text-tiny text-default-400">{file.path}</span>
                </div>
              </div>
            </SelectItem>
          )}
        </Select>
      </div>
      <Divider />
      <div className="flex flex-col justify-between gap-2">
        <Select
          items={ENUM}
          label="Enums"
          labelPlacement="outside-left"
          size="sm"
          classNames={{
            popoverContent: "dark text-foreground dark:bg-content1! bg-content1!",
          }}
        >
          {ENUM.map((e) => (
            <SelectItem
              key={e.value}
              textValue={e.name}
              className="dark:bg-content1[100%]! bg-content1[100%]!"
            >
              {e.name}
            </SelectItem>
          ))}
        </Select>
        <Slider
          label="Slider"
          aria-label="Slider"
          defaultValue={0.2}
          maxValue={1}
          minValue={0}
          size="sm"
          step={0.01}
        />
        <Checkbox defaultSelected>Option</Checkbox>
      </div>
    </div>
  );
}

function TransformComponentPanel() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="w-16 text-xs text-default-500">Position</span>
        <div className="flex gap-2 max-w-48 ">
          <NumberInput label="X" size="sm" labelPlacement="outside-left" aria-label="Position X" />
          <NumberInput label="Y" size="sm" labelPlacement="outside-left" aria-label="Position Y" />
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="w-16 text-xs text-default-500">Rotation</span>
        <div className="flex gap-2 max-w-48">
          <NumberInput label="X" size="sm" labelPlacement="outside-left" aria-label="Rotation X" />
          <NumberInput label="Y" size="sm" labelPlacement="outside-left" aria-label="Rotation Y" />
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="w-16 text-xs text-default-500">Scale</span>
        <div className="flex gap-2 max-w-48">
          <NumberInput label="X" size="sm" labelPlacement="outside-left" aria-label="Scale X" />
          <NumberInput label="Y" size="sm" labelPlacement="outside-left" aria-label="Scale Y" />
        </div>
      </div>
    </div>
  );
}
