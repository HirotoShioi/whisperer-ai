import { XIcon, FileIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Resource } from "@/lib/db/schema/resources";
import { useFetcher } from "react-router-dom";
import { useMemo, useState } from "react";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Markdown } from "@/components/markdown";
import ContentUploader from "./content-uploader";
import { useChatContext } from "@/pages/chat/context";
import { Skeleton } from "@/components/ui/skeleton";
import Dropdown from "@/components/dropdown";
import { cn } from "@/lib/utils";

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
      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
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

function ResourceItemSkeleton() {
  return (
    <div className="flex items-center p-2 bg-white rounded-lg shadow-md border w-full">
      <Skeleton className="w-10 h-10 rounded-lg mr-3" />
      <Skeleton className="flex-1 h-5" />
      <Skeleton className="w-8 h-8 rounded-full ml-2" />
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
      <div className="flex flex-row items-center justify-center px-2 gap-4">
        <FileIcon className="w-8 h-8 text-gray-500" />
        <p className="text-gray-500 text-sm mt-2">
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

function ResourceListSkeleton() {
  return (
    <div className="flex flex-col gap-2 w-full px-4">
      {[...Array(5)].map((_, index) => (
        <ResourceItemSkeleton key={index} />
      ))}
    </div>
  );
}

function ResourceContent({ resource }: { resource: Resource }) {
  const rendered = useMemo(() => {
    switch (resource.fileType) {
      case "text/plain":
        return <p className="whitespace-pre-wrap">{resource.content}</p>;
      case "text/markdown":
        return <Markdown content={resource.content} />;
      case "application/json":
        return (
          <div className="bg-gray-100 p-2 rounded-md">
            <code className="whitespace-pre-wrap">{resource.content}</code>
          </div>
        );
      default:
        return <p className="whitespace-pre-wrap">{resource.content}</p>;
    }
  }, [resource.content, resource.fileType]);
  return (
    <ScrollArea className="h-[calc(100vh-6rem)]">
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
      <div className="sticky flex flex-col justify-between gap-2">
        <div className="pb-6 top-0 p-4 flex items-center">
          <Dropdown />
        </div>
        <div className="flex justify-between items-center px-4">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold">Contents</h2>
            <ContentUploader />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-2 flex-row w-full px-4 pt-4">
        <div className="flex-1 flex items-center overflow-hidden">
          <h2 className="text-lg font-semibold truncate">{resource.title}</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="rounded-full"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>
    </>
  );
}

export function ContentPanel() {
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null
  );
  const isMobile = useMediaQuery("(max-width: 1400px)");
  const { panelState, setPanelState, resources, isUploadingContent } =
    useChatContext();

  const panelWidth = isMobile
    ? "100%"
    : panelState === "detail"
      ? "700px"
      : "300px";

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

  const isHidden = isMobile || panelState === "closed";

  return (
    <div className={`z-[5] pointer-events-auto ${isHidden ? "hidden" : ""}`}>
      <div
        className={cn(
          "h-full shadow-md relative",
          panelState === "detail" ? "bg-white" : "bg-gray-50"
        )}
        style={{ width: panelWidth }}
      >
        <div className="flex flex-col gap-4">
          <ResourceHeader resource={selectedResource} onClose={handleClose} />
          <div className="overflow-hidden">
            <div className="w-full overflow-y-auto h-full">
              {isUploadingContent ? (
                <ResourceListSkeleton />
              ) : selectedResource ? (
                <ResourceContent resource={selectedResource} />
              ) : (
                <ResourceList resources={resources} onSelect={setResource} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
