import React, { useEffect, useState } from "react";
import { Card, ListGroup, Container, Row, Col, Button, Modal, Form } from "react-bootstrap";
import useAuth from "../../Hooks/useAuth";
import { updateProfile, changePassword } from "../../Service/userApi";

export default function UserProfile() {
  const { user, ensureTokenValid, getProfile } = useAuth();
  const [showEdit, setShowEdit] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [formData, setFormData] = useState({});
  const [passData, setPassData] = useState({ oldPassword: "", newPassword: "", confirmNewPass: "" });

  useEffect(() => {
    const fetchData = async () => {
      const token = await ensureTokenValid();
      if (token && !user) {
        await getProfile(token);
      }
    };
    fetchData();
  }, []);

  if (!user) return <p className="text-center mt-5">Đang tải thông tin...</p>;

  // 🔹 Mở modal cập nhật
  const handleEdit = () => {
    setFormData({
      fullName: user.fullName || "",
      phone: user.phone || "",
      address: user.address || "",
      gender: user.gender || "",
      birthDate: user.birthDate ? user.birthDate.split("T")[0] : "" // format yyyy-MM-dd
    });
    setShowEdit(true);
  };

  // 🔹 Lưu cập nhật
  const saveEdit = async () => {
    const token = await ensureTokenValid();
    try {
      await updateProfile(token, formData);
      alert("Cập nhật thành công ✅");
      setShowEdit(false);
      await getProfile(token); // refresh lại thông tin
    } catch (err) {
      alert("Cập nhật thất bại ❌");
    }
  };

  // 🔹 Đổi mật khẩu
  const savePassword = async () => {
    const token = await ensureTokenValid();
    try {
      await changePassword(token, passData);
      alert("Đổi mật khẩu thành công ✅");
      setShowPass(false);
    } catch (err) {
      alert("Đổi mật khẩu thất bại ❌");
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <Card>
            <Card.Header className="text-center bg-primary text-white">
              <h5>Thông tin tài khoản</h5>
            </Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item><strong>Họ tên:</strong> {user.fullName}</ListGroup.Item>
              <ListGroup.Item><strong>Email:</strong> {user.email}</ListGroup.Item>
              <ListGroup.Item><strong>Số điện thoại:</strong> {user.phone}</ListGroup.Item>
              <ListGroup.Item><strong>Địa chỉ:</strong> {user.address}</ListGroup.Item>
              <ListGroup.Item><strong>Ngày sinh:</strong> {user.birthDate ? new Date(user.birthDate).toLocaleDateString() : "Chưa cập nhật"}</ListGroup.Item>
              <ListGroup.Item><strong>Giới tính:</strong> {user.gender}</ListGroup.Item>
              <ListGroup.Item><strong>Vai trò:</strong> {user.role}</ListGroup.Item>
              <ListGroup.Item><strong>Trạng thái:</strong> {user.status}</ListGroup.Item>
              <ListGroup.Item><strong>Ngày tạo:</strong> {new Date(user.createdAt).toLocaleDateString()}</ListGroup.Item>
            </ListGroup>
            <Card.Footer className="text-center">
              <Button variant="warning" className="me-2" onClick={handleEdit}>
                ✏️ Cập nhật thông tin
              </Button>
              <Button variant="danger" onClick={() => setShowPass(true)}>
                🔑 Đổi mật khẩu
              </Button>
            </Card.Footer>
          </Card>
        </Col>
      </Row>

      {/* Modal cập nhật thông tin */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)}>
        <Modal.Header closeButton><Modal.Title>Cập nhật thông tin</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Họ tên</Form.Label>
              <Form.Control value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Số điện thoại</Form.Label>
              <Form.Control value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Địa chỉ</Form.Label>
              <Form.Control value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Ngày sinh</Form.Label>
              <Form.Control type="date" value={formData.birthDate} onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Giới tính</Form.Label>
              <Form.Select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
                <option value="">Chọn</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEdit(false)}>Đóng</Button>
          <Button variant="primary" onClick={saveEdit}>Lưu</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal đổi mật khẩu */}
      <Modal show={showPass} onHide={() => setShowPass(false)}>
        <Modal.Header closeButton><Modal.Title>Đổi mật khẩu</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Mật khẩu cũ</Form.Label>
              <Form.Control type="password" value={passData.oldPassword} onChange={(e) => setPassData({ ...passData, oldPassword: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mật khẩu mới</Form.Label>
              <Form.Control type="password" value={passData.newPassword} onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Xác nhận mật khẩu mới</Form.Label>
              <Form.Control type="password" value={passData.confirmNewPass} onChange={(e) => setPassData({ ...passData, confirmNewPass: e.target.value })} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPass(false)}>Đóng</Button>
          <Button variant="primary" onClick={savePassword}>Đổi mật khẩu</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
