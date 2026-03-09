import React from "react";
import { Card, CardHeader, CardBody } from "reactstrap";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function Loader(props) {
  return (
    <Card>
      <CardHeader>
        <h4 className="card-title mb-0">{props.head || "Loading Data..."}</h4>
      </CardHeader>
      <CardBody>
        <Skeleton className={`bg-info mt-2`} height="2rem" />
      </CardBody>
    </Card>
  );
}

export default Loader;
