import { AnimatePresence, motion } from "framer-motion";
import { XIcon, FileIcon, ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Resource } from "@/lib/db/schema/resources";
import { useFetcher } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { PanelState } from "./page";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Markdown } from "@/components/markdown";

function ResourceItem({
  resource,
  onSelect,
}: {
  resource: Resource;
  onSelect: (resource: Resource) => void;
}) {
  const fetcher = useFetcher();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="flex items-center p-2 bg-white rounded-lg shadow-md border hover:bg-gray-50 transition cursor-pointer w-full"
      onClick={() => onSelect(resource)}
    >
      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg mr-3">
        <FileIcon className="w-6 h-6 text-gray-600" />
      </div>
      <div className="flex-1 flex items-center overflow-hidden">
        <p className="text-sm font-medium truncate">{resource.title}</p>
      </div>
      <fetcher.Form method="DELETE" onClick={handleDelete}>
        <input type="hidden" name="resourceId" value={resource.id} />
        <Button
          className="text-gray-400 hover:text-red-600"
          size="icon"
          type="submit"
          variant="ghost"
        >
          <XIcon className="w-4 h-4" />
        </Button>
      </fetcher.Form>
    </div>
  );
}

function ResourceList({
  resources,
  onSelect,
}: {
  resources: Resource[];
  onSelect: (resource: Resource) => void;
}) {
  if (resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <FileIcon className="w-10 h-10 text-gray-500" />
        <p className="text-gray-500 text-sm text-center mt-2">
          Drag and drop files into the chat to add them as resources.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full px-4">
      {resources.map((resource, index) => (
        <ResourceItem key={index} resource={resource} onSelect={onSelect} />
      ))}
    </div>
  );
}

function ResourceContent({ resource }: { resource: Resource }) {
  const rendered = useMemo(() => {
    if (resource.fileType === "text") {
      return <p className="whitespace-pre-wrap">{resource.content}</p>;
    }
    return <Markdown content={resource.content} />;
  }, [resource.content, resource.fileType]);
  return (
    <ScrollArea className="h-[calc(100vh-11rem)]">
      <div className="px-4 pb-4">{rendered}</div>
    </ScrollArea>
  );
}

function ResourceHeader({
  resource,
  onClose,
}: {
  resource: Resource | null;
  onClose: () => void;
}) {
  if (!resource) {
    return (
      <div className="flex justify-between items-center px-4 pt-4">
        <div className="flex-1 flex items-center">
          <h2 className="text-lg font-semibold">Contents</h2>
        </div>
        <XIcon className="h-6 w-6" onClick={onClose} />
      </div>
    );
  }

  return (
    <div className="flex gap-2 flex-row w-full px-4 pt-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="rounded-full"
      >
        <ArrowLeftIcon className="h-6 w-6" />
      </Button>
      <div className="flex-1 flex items-center overflow-hidden">
        <h2 className="text-lg font-semibold truncate">{resource.title}</h2>
      </div>
    </div>
  );
}

type ContentPanelProps = {
  resources: Resource[];
  panelState: PanelState;
  setPanelState: React.Dispatch<React.SetStateAction<PanelState>>;
};

export function ContentPanel({
  resources,
  panelState,
  setPanelState,
}: ContentPanelProps) {
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null
  );
  const isMobile = useMediaQuery("(max-width: 768px)");
  function setResource(resource: Resource) {
    setSelectedResource(resource);
    setPanelState("detail");
  }

  const handleClose = () => {
    if (selectedResource) {
      setSelectedResource(null);
      setPanelState("list");
    } else {
      setPanelState("closed");
    }
  };

  const panelWidth = useMemo(() => {
    if (isMobile) {
      return "w-full";
    }
    switch (panelState) {
      case "detail":
        return "md:w-[50rem]";
      case "list":
        return "w-[24rem]";
      case "closed":
        return "w-[0rem]";
    }
  }, [isMobile, panelState]);

  useEffect(() => {
    if (panelState === "closed") {
      setSelectedResource(null);
    }
  }, [panelState]);
  return (
    <AnimatePresence>
      {panelState !== "closed" && (
        <motion.div
          className={`fixed bottom-0 top-0 right-0 flex flex-col z-[5] pointer-events-auto pt-16 md:pb-4 md:pr-1 bg-white ${panelWidth}`}
          initial={false}
          exit={{ x: "100%" }}
          animate={{ x: "0%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex-shrink-0 h-full border rounded-lg shadow-md relative">
            <div className="flex flex-col gap-4">
              <ResourceHeader
                resource={selectedResource}
                onClose={handleClose}
              />
              <div className="w-full overflow-y-auto h-full">
                {selectedResource ? (
                  <ResourceContent resource={selectedResource} />
                ) : (
                  <ResourceList resources={resources} onSelect={setResource} />
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
