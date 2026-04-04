import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Table,
  Row,
  Col,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  FormGroup,
} from "reactstrap";

import * as ApiManager from "../../helpers/ApiManager.tsx";
import Loader from "components/common/Loader.js";
import { FormatNumber } from "helpers/utils.js";
import { toast } from "react-toastify";

function AdminProducts() {
  const [products, setProducts] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
  });
  const [APIWorking, setAPIWorking] = useState(false);

  const fetchProducts = async () => {
    const res = await ApiManager.AdminGetProducts();
    if (res && res.data) {
      setProducts(res.data);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAdd = async () => {
    if (!form.name || !form.price || !form.description) {
      toast.error("Please fill in name, description, and price");
      return;
    }
    try {
      if (APIWorking) return;
      setAPIWorking(true);
      const res = await ApiManager.AdminAddProduct({
        ...form,
        price: Number(form.price),
      });
      if (res) {
        toast.success("Product added");
        setShowAdd(false);
        setForm({ name: "", description: "", price: "", image: "" });
        fetchProducts();
      }
      setAPIWorking(false);
    } catch (e) {
      setAPIWorking(false);
      toast.error(e.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await ApiManager.AdminDeleteProduct(id);
      if (res) {
        toast.success("Product removed");
        fetchProducts();
      }
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="content">
      <Row>
        <Col>
          <Card>
            <CardHeader>
              <Row>
                <Col>
                  <CardTitle tag="h4">Store Management</CardTitle>
                </Col>
                <Col className="text-right">
                  <Button
                    color="primary"
                    size="sm"
                    onClick={() => setShowAdd(!showAdd)}
                  >
                    {showAdd ? "Cancel" : "+ Add Product"}
                  </Button>
                </Col>
              </Row>
            </CardHeader>
            <CardBody>
              {showAdd && (
                <Card
                  className="p-3 mb-4"
                  style={{ background: "#fdf2f5" }}
                >
                  <Row>
                    <Col md={3}>
                      <FormGroup>
                        <Label>Name</Label>
                        <Input
                          placeholder="Product name"
                          value={form.name}
                          onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                          }
                        />
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup>
                        <Label>Price (Rs.)</Label>
                        <Input
                          type="number"
                          placeholder="5000"
                          value={form.price}
                          onChange={(e) =>
                            setForm({ ...form, price: e.target.value })
                          }
                        />
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup>
                        <Label>Image filename</Label>
                        <Input
                          placeholder="p1.png (optional)"
                          value={form.image}
                          onChange={(e) =>
                            setForm({ ...form, image: e.target.value })
                          }
                        />
                      </FormGroup>
                    </Col>
                    <Col md={3} className="d-flex align-items-end">
                      <Button
                        color="primary"
                        onClick={handleAdd}
                        disabled={APIWorking}
                      >
                        {APIWorking ? "Adding..." : "Add Product"}
                      </Button>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <FormGroup>
                        <Label>Description</Label>
                        <Input
                          type="textarea"
                          placeholder="Product description"
                          value={form.description}
                          onChange={(e) =>
                            setForm({ ...form, description: e.target.value })
                          }
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                </Card>
              )}

              {products === null ? (
                <Loader />
              ) : products.length === 0 ? (
                <p className="text-center" style={{ color: "#999" }}>
                  No products in store. Add one above.
                </p>
              ) : (
                <Table responsive>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Price</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p, i) => (
                      <tr key={p._id}>
                        <td>{i + 1}</td>
                        <td>{p.name}</td>
                        <td>
                          {p.description && p.description.length > 60
                            ? p.description.substring(0, 60) + "..."
                            : p.description}
                        </td>
                        <td>Rs. {FormatNumber(p.price)}</td>
                        <td>
                          <Button
                            color="danger"
                            size="sm"
                            onClick={() => handleDelete(p._id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default AdminProducts;
