import React, { useState } from "react";

import {
  Card,
  CardBody,
  Col,
  Row,
  Button,
  CardTitle,
  CardImg,
  CardSubtitle,
  CardText,
  CardHeader,
  Label,
  Input,
  FormFeedback,
  Form,
} from "reactstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import * as ApiManager from "../../helpers/ApiManager.tsx";
import * as Yup from "yup";
import { useFormik } from "formik";

import { FormatNumber } from "helpers/utils.js";
import moment from "moment";

function Products() {
  const [selected, setselected] = useState(null);

  const products = [
    {
      name: "IPhone 15",
      price: 50000,
      desc: "The iPhone 15 series is Apple's latest model of smartphone, so this is where you want to be if you're interested in the latest and greatest from the world's most famous phone.",
      image: "p1.png",
    },
    {
      name: "Apple Airpods",
      price: 5000,
      desc: "Apple's AirPods 2 brought wireless charging and hands-free Siri into the mix with longer call times and clearer audio. the AirPods are still at the top of the heap for iPhone owners.",
      image: "p2.png",
    },
    {
      name: "Samsung S95C OLED TV",
      price: 100000,
      desc: "The Samsung S95C OLED TV is a premium and well-rounded TV that impressed in our benchmark testing across-the-board. Upgrades compared to the old model show Samsung is taking OLED seriously.",
      image: "p3.png",
    },
    {
      name: "Dell XPS 15",
      price: 27000,
      desc: "this year's Dell XPS 15 OLED provides everything you are looking for in a notebook. Like its predecessors, the XPS 15 delivers a near-perfect balance of style, performance and portability.",
      image: "p4.png",
    },
  ];

  const Checkout = () => {
    const [APIWorking, setAPIWorking] = useState(false);
    const validation = useFormik({
      enableReinitialize: true,

      initialValues: {
        name: products[selected].name,
        cardnumber: "",
        cvc: "",
        expiration: "",
        price: products[selected].price,
      },
      validationSchema: Yup.object({
        cardnumber: Yup.string()
          .required("Please enter card number")
          .length(19, "Please enter correct card number"),
        cvc: Yup.string()
          .required("Please enter CVC")
          .length(3, "Please enter CVC"),
        expiration: Yup.string()
          .required("Please enter expiration date")
          .length(5, "Please enter Correct date")
          .test(
            "expiration",
            "Please enter a valid expiration date in MM/YY format",
            (value) => {
              return moment(value, "MM/YY").isValid();
            },
          ),
      }),
      onSubmit: async (values) => {
        try {
          if (APIWorking) return;
          setAPIWorking(true);
          const res = await ApiManager.BuyCompanyProduct({
            ...values,
            cardnumber: values.cardnumber.replace(/\D/g, ""),
          });
          if (res) {
            toast.success("Product bought");
            setselected(null);
          }
          setAPIWorking(false);
        } catch (e) {
          setAPIWorking(false);
          toast.error(`${e.message}`);
        }
      },
    });

    return (
      <>
        <Col xs={12} md={8}>
          <Card>
            <CardHeader>
              <CardTitle tag="h3" className="font-weight-bold">
                Checkout
              </CardTitle>
            </CardHeader>
            <CardBody className="pb-5">
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  validation.handleSubmit();
                  return false;
                }}
                action="#"
              >
                <Row>
                  <Col xs={{ size: 8, offset: 2 }}>
                    <Label htmlFor="cardnumber" className="form-label">
                      Card Number
                    </Label>
                    <Input
                      name="cardnumber"
                      maxLength={19}
                      className="form-control mt-2"
                      placeholder="XXXX XXXX XXXX XXXX"
                      type="text"
                      onChange={(e) => {
                        let text = e.target.value.replace(/\D/g, "");
                        text = text.replace(/(.{4})/g, "$1 ");
                        text = text.trim();
                        validation.setFieldValue("cardnumber", text);
                      }}
                      value={validation.values.cardnumber}
                      onBlur={validation.handleBlur}
                      invalid={
                        validation.touched.cardnumber &&
                        validation.errors.cardnumber
                          ? true
                          : false
                      }
                      valid={validation.values.cardnumber.length === 19}
                    />
                    {validation.touched.cardnumber &&
                    validation.errors.cardnumber ? (
                      <FormFeedback type="invalid">
                        {validation.errors.cardnumber}
                      </FormFeedback>
                    ) : null}
                  </Col>
                </Row>
                <Row className="pt-4">
                  <Col xs={{ size: 4, offset: 2 }}>
                    <Label htmlFor="cvc" className="form-label">
                      CVC
                    </Label>
                    <Input
                      name="cvc"
                      maxLength={3}
                      className="form-control mt-2"
                      placeholder="XXX"
                      type="text"
                      onChange={(e) => {
                        let text = e.target.value.replace(/\D/g, "");
                        validation.setFieldValue("cvc", text);
                      }}
                      value={validation.values.cvc}
                      onBlur={validation.handleBlur}
                      invalid={
                        validation.touched.cvc && validation.errors.cvc
                          ? true
                          : false
                      }
                      valid={validation.values.cvc.length === 3}
                    />
                    {validation.touched.cvc && validation.errors.cvc ? (
                      <FormFeedback type="invalid">
                        {validation.errors.cvc}
                      </FormFeedback>
                    ) : null}
                  </Col>
                  <Col xs={{ size: 4 }}>
                    <Label htmlFor="expiration" className="form-label">
                      Expiration Date
                    </Label>
                    <Input
                      name="expiration"
                      maxLength={5}
                      className="form-control mt-2"
                      placeholder="MM/YY"
                      type="text"
                      onChange={(e) => {
                        let text = e.target.value.replace(/\D/g, "");
                        if (text.length > 2) {
                          text = text.replace(/^(.{2})(.*)$/, "$1/$2");
                        }
                        validation.setFieldValue("expiration", text);
                      }}
                      value={validation.values.expiration}
                      onBlur={validation.handleBlur}
                      invalid={
                        validation.touched.expiration &&
                        validation.errors.expiration
                          ? true
                          : validation.values.expiration.length === 5
                          ? !moment(
                              validation.values.expiration,
                              "MM/YY",
                            ).isValid()
                          : false
                      }
                      valid={
                        validation.values.expiration.length === 5 &&
                        moment(validation.values.expiration, "MM/YY").isValid()
                      }
                    />
                    {validation.touched.expiration &&
                    validation.errors.expiration ? (
                      <FormFeedback type="invalid">
                        {validation.errors.expiration}
                      </FormFeedback>
                    ) : null}
                  </Col>
                </Row>
                <Row>
                  <Col className="text-center mt-2 pt-2">
                    <Button color="danger" type="submit" disabled={APIWorking}>
                      {APIWorking ? "ordering..." : "Place Order!"}
                    </Button>
                  </Col>
                </Row>
              </Form>
            </CardBody>
          </Card>
        </Col>
        <Col>
          <Card>
            <CardImg
              alt="Card image cap"
              src={require(`assets/img/products/${products[selected].image}`)}
              top
              width="100%"
            />
            <CardBody>
              <CardTitle tag="h4" className="font-weight-bold">
                {products[selected].name}
              </CardTitle>
              <CardSubtitle
                className="mb-2 text-muted font-weight-bold"
                tag="h5"
              >
                Rs. {FormatNumber(products[selected].price)}
              </CardSubtitle>
              <CardText>{products[selected].desc}</CardText>
            </CardBody>
          </Card>
        </Col>
      </>
    );
  };

  return (
    <>
      <div className="content">
        <ToastContainer />

        <div
          className="bg-info shadow"
          style={{
            width: "100%",
            zIndex: 3,
            position: "absolute",
          }}
        >
          <div className="text-center mt-2">
            <h4 className={"text-white fw-bold"}>
              <b>Hello Bank Products</b>
            </h4>
          </div>
        </div>

        <Row
          style={{
            paddingTop: "10vh",
            width: "90%",
            marginLeft: "5%",
          }}
        >
          {selected === null ? (
            <>
              {products.map((x, i) => (
                <Col key={`${i}`} xs={12} md={6} lg={4}>
                  <Card>
                    <CardImg
                      alt="Card image cap"
                      src={require(`assets/img/products/${x.image}`)}
                      top
                      width="100%"
                    />
                    <CardBody>
                      <CardTitle tag="h4" className="font-weight-bold">
                        {x.name}
                      </CardTitle>
                      <CardSubtitle
                        className="mb-2 text-muted font-weight-bold"
                        tag="h5"
                      >
                        Rs. {FormatNumber(x.price)}
                      </CardSubtitle>
                      <CardText>{x.desc}</CardText>
                      <div className="text-center mt-3">
                        <Button color="info" onClick={() => setselected(i)}>
                          Buy Now
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              ))}
            </>
          ) : (
            <Checkout />
          )}
        </Row>
      </div>
    </>
  );
}

export default Products;
