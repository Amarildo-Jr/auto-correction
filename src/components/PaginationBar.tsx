import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import clsx from "clsx";

interface PaginationBarProps {
  total: number;
  current: number;
  onChange: (page: number) => void;
}

const PaginationBar = (props: PaginationBarProps) => {
  return (
    <Pagination className="">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            isActive={props.current !== 1}
            onClick={() => {
              if (props.current !== 1) props.onChange(props.current - 1);
            }}
            className={clsx("hover:cursor-pointer", {
              "hover:cursor-not-allowed": props.current === 1,
            })}
          />
        </PaginationItem>

        {Array.from({ length: props.total }).map((_, index) => {
          const i = index + 1;

          if (i < props.current - 4 || i > props.current + 4) {
            return null;
          } else if (i === props.current - 4 || i === props.current + 4) {
            return (
              <PaginationItem key={i}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          } else {
            return (
              <PaginationItem key={i}>
                <PaginationLink
                  isActive={props.current === i}
                  onClick={() => props.onChange(i)}
                >
                  {i}
                </PaginationLink>
              </PaginationItem>
            );
          }
        })}
        <PaginationItem>
          <PaginationNext
            isActive={props.current !== props.total}
            onClick={() => {
              if (props.current !== props.total)
                props.onChange(props.current + 1);
            }}
            className={clsx("hover:cursor-pointer", {
              "hover:cursor-not-allowed": props.current === props.total,
            })}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export { PaginationBar };
