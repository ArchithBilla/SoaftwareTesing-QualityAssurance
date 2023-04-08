import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Form";
import axios from "axios";
import Home_news from "./home_news";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Pagination from "react-bootstrap/Pagination";

import { useState, useEffect } from "react";
let selectedIndex = [];
const categories = [
  "General",
  "Health",
  "Science",
  "Sports",
  "Technology",
  "Entertainment",
  "Bussiness",
];
export default function Home(props) {
  const [selectedIndexArray, setselectedIndexArray] = useState([]);
  const [data, setData] = useState([]);
  const [preferredData, setPreferredData] = useState([]);
  const [pageActive, setPageActive] = useState(1);
  const [saveDisable, setSaveDisable] = useState(false);
  useEffect(() => {
    let selectedPath = "";
    selectedIndex = [];
    categories.forEach((item, index) => {
      if (props.userData[item]) {
        selectedIndex.push(index);
      }
    });
    console.log("i M H");
    setselectedIndexArray(selectedIndex);

    async function fetchData() {
      if (props.authUser === "") {
        try {
          const res = await axios.post("http://localhost:8000/home/news", {
            userName: props.authUser,
          });
          setData(res.data);
        } catch (err) {
          console.log(err);
        }
      } else {
        let temp = {};
        selectedIndex.forEach(async (item, index) => {
          selectedPath = selectedPath + categories[item].toLowerCase() + "&";
          await axios
            .post("http://localhost:8000/home/news/categories", {
              userName: props.authUser,
              category: categories[item].toLowerCase(),
            })
            .then((res) => {
              categories.forEach((item) => {
                if (item.toLowerCase() === Object.keys(res.data)[0]) {
                  temp[item] = res.data[item.toLowerCase()];
                }
              });
              props.setApiData(temp);
            });
          if (index + 1 === selectedIndex.length) {
            await axios
              .post("http://localhost:8000/home/news/all", {
                selectedPath: selectedPath,
              })
              .then((res) => {
                temp["Home"] = res.data;
                setTimeout(() => {
                  setPreferredData(temp);
                  setData(temp["Home"]);
                }, 1000);
              });
          }
        });
      }
    }
    fetchData();
  }, []);
  const selectCategory = (data, index) => {
    if (selectedIndex.indexOf(index) === -1) {
      // empty check
      selectedIndex.push(index);
      setselectedIndexArray(selectedIndex);
    } else {
      const newIndex = selectedIndex.indexOf(index);
      selectedIndex.splice(newIndex, 1);
      setselectedIndexArray(selectedIndex);
    }
    if (selectedIndex.length === 0) setSaveDisable(true);
    else setSaveDisable(false);
  };
  const saveChanges = () => {
    let temp = {};
    if (selectedIndexArray.length !== 0) {
      let selectedPath = "";
      const x = async () => {
        await axios
          .post("http://localhost:8000/settings", {
            selectedIndexArray: selectedIndexArray,
            userName: props.authUser,
          })
          .then((response) => {
            let newPrefernces = [];
            Object.keys(response.data).forEach(async (item, index) => {
              if (response.data[item] === 1) {
                newPrefernces.push(index);
                selectedPath = selectedPath + item.toLowerCase() + "&";
                await axios
                  .post("http://localhost:8000/home/news/categories", {
                    userName: props.authUser,
                    category: item,
                  })
                  .then((res) => {
                    categories.forEach((item, index) => {
                      if (item.toLowerCase() === Object.keys(res.data)[0]) {
                        temp[item] = res.data[item.toLowerCase()];
                      }
                    });
                  });
                await axios
                  .post("http://localhost:8000/home/news/all", {
                    selectedPath: selectedPath,
                  })
                  .then((res) => {
                    temp["Home"] = res.data;
                  });
              }
            });
            setselectedIndexArray(newPrefernces);
          });
      };
      x();

      setTimeout(() => {
        setShow(false);
      }, 1000);
      setPreferredData(temp);
    }
  };
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);

  if (typeof props.pageStatus === "function") props?.pageStatus("Home");
  const testOnChange = () => {};
  const setRefresh = async () => {
    try {
      const res = await axios.post("http://localhost:8000/home/news", {
        userName: props.authUser,
      });
      setData(res.data);
    } catch (err) {
      console.log(err);
    }
    // setRandom(Math.floor(Math.random() * 101))
  };

  const setKey = (e) => {
    setData(preferredData[e]);
  };
  const setSettings = () => {
    let temp = [];
    Object.keys(preferredData).forEach((item) => {
      if (categories.includes(item)) {
        temp.push(categories.indexOf(item));
      }
    });
    setselectedIndexArray(temp);
    setShow(true);
    setSaveDisable(false);
  };
  return (
    <>
      <Container>
        <Row style={{ backgroundColor: "rgb(230, 238, 230)" }}>
          <Col xs={2}>
            <Button variant="success" className="refresh" onClick={setRefresh}>
              Refresh
            </Button>
          </Col>
          <Col xs={8}>
            {props.authUser !== "" ? (
              <Tabs
                onSelect={(k) => setKey(k)}
                className="mb-3"
                defaultActiveKey="Home"
              >
                <Tab eventKey={"Home"} title={"Home"} onSelect = {()=>setPageActive(1)}></Tab>
                {Object.keys(preferredData).map((item, index) => {
                  if (item !== "Home") {
                    return <Tab eventKey={item} title={item} onSelect = {()=>setPageActive(1)}></Tab>;
                  }
                })}
              </Tabs>
            ) : null}
          </Col>
          <Col xs={2}>
            {props.authUser !== "" ? (
              <Button
                className="settings"
                variant="secondary"
                onClick={setSettings}
              >
                Settings
              </Button>
            ) : null}
          </Col>
        </Row>
        <Row style={{ backgroundColor: "rgb(230, 238, 230)" }}>
          <Col xs={12}>
            <div className="main_container">
              <Modal
                show={show}
                onHide={handleClose}
                animation={true}
                size="lg"
                centered
              >
                <Modal.Header closeButton>
                  <Modal.Title id="contained-modal-title-vcenter">
                    Choose your favorites
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Row>
                    {categories.map((item, index) => {
                      return (
                        <Col id="radio" style={{ padding: "5px" }}>
                          {" "}
                          <Form>
                            <span
                              id={`switch-${index}`}
                              onChange={testOnChange}
                            >
                              <Form.Check
                                type="switch"
                                id="custom-switch"
                                defaultChecked={
                                  selectedIndexArray.includes(
                                    categories.indexOf(item)
                                  )
                                    ? true
                                    : false
                                }
                                label={item}
                                onChange={(e) => {
                                  selectCategory(item, index);
                                }}
                              />
                            </span>
                          </Form>
                        </Col>
                      );
                    })}
                  </Row>
                </Modal.Body>
                <Modal.Footer>
                  {saveDisable ? (
                    <p>You must select atleast one preference</p>
                  ) : null}
                  <Button
                    className={"modal-save"}
                    onClick={saveChanges}
                    disabled={saveDisable}
                  >
                    Save
                  </Button>
                </Modal.Footer>
              </Modal>
              {data?.map((item, index) => {
                return (
                  <Home_news
                    data={item}
                    index={index}
                    pageActive={pageActive}
                  />
                );
              })}
            </div>
          </Col>
        </Row>
      </Container>
      <Pagination className="pagination">
        {[1, 2, 3, 4, 5].map((item) => {
          return (
            <Pagination.Item
              key={item}
              active={pageActive === item ? true : false}
              onClick={(e) => {
                setPageActive(item);
              }}
            >
              {item}
            </Pagination.Item>
          );
        })}
      </Pagination>
    </>
  );
}
