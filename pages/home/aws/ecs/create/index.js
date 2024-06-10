import { useState, useContext, useEffect } from 'react';
import { regions } from "@/utils/aws";
import { getCredentials, Separation } from '@/utils/general';
import { AuthContext } from "@/pages/_app";

export default function CreateECS({ setWarning, setToken }) {

  const { token } = useContext(AuthContext);

  const INIT = {
    cluster: {
      account: "",
      region: "",
      clusterName: "",
    },
    disabled: {
      region: true,
      clusterName: true,
    },
    chooseFrom: {
      accounts: [],
    }
  }

  const [cluster, setcluster] = useState(INIT.cluster);
  const [chooseFrom, setChooseFrom] = useState(INIT.chooseFrom)
  const [disabled, setDisabled] = useState(INIT.disabled)

  const [terminalOutput, setTerminalOutput] = useState("");


  // Sequentiel disabled fields cancel
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const clusterArray = Object.keys(cluster);
    const index = clusterArray.indexOf(name);
    (index !== -1) && setDisabled((prev) => ({ ...prev, [clusterArray[index + 1]]: false }))
    name === "account" && setcluster(INIT.cluster);
    setcluster({ ...cluster, [name]: value });
  };



  const handleCreateECS = async (e) => {
    e.preventDefault();
    setTerminalOutput("");
    setCreateButtonContent(<span><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> please wait</span>);
    try {
      // Constructing FormData object with cluster configuration
      const clusterConfig = new FormData();
      clusterConfig.append("token", token); //token authentication

      for (const key in cluster) {
        if (Object.hasOwnProperty.call(cluster, key)) {
          clusterConfig.append(key, cluster[key]);
        }
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_ADDR}terraform/aws/ecs/`,
        {
          method: "POST",
          body: clusterConfig
        }
      );

      if (!response.ok) {
        // If response is not okay, throw an error
        throw new Error(`Failed to create ECS cluster. Status: ${response.status}`);
      }

      const data = await response.json();

      // Update UI based on response
      setWarning({
        message: `Cluster ${cluster.clusterName} created successfully.`,
        type: "success",
        isShown: true
      });
      setTerminalOutput(data.stdOut);
      return true;
    } catch (error) {
      // Handle errors
      console.error(error);
      setWarning({
        message: "Something went wrong. Please try again or contact support.",
        type: "danger",
        isShown: true
      });
      setTerminalOutput(""); // Clear terminal output
      return false;
    } finally {
      setTerminalOutput("");
      setCreateButtonContent(<span>Create</span>);
    }
  };


  useEffect(() => {
    getCredentials(token, setChooseFrom).then((isOk) => {
      if (!isOk) setToken("expired")
    });;

  }, [token, setToken]);

  const [createButtonContent, setCreateButtonContent] = useState(<span>Create</span>);


  return (
    <div className=" d-flex align-items-center justify-content-center p-5 tilt-warp-title">
      <div className="row d-flex justify-content-center align-items-center col-xl-4 col-lg-6 col-md-8 col-sm-10 col-xs-12">
        <div className="col-lg-12 col-xl-11 border border-dark rounded mt-3">
          <div
            className="bg-transparent text-dark rounded"
          >
            <div className="card-body p-md-5 ">
              <div className="row justify-content-center d-flex justify-content-center align-items-center">
                <div className="col-12">
                  <form onSubmit={handleCreateECS}>
                    <h3 className="text-center row mb-5">
                      <div className="col">Create an ECS cluster</div>
                      <div className="col-auto">
                        <button className="btn btn-light btn-lg" title="Reset" type="button" onClick={() => { setDisabled(INIT.disabled); setChooseFrom((prev) => ({ accounts: prev.accounts })); setcluster(INIT.cluster) }}>
                          <i className="bi bi-trash3-fill cursor-pointer"></i>
                        </button>
                      </div>
                    </h3>
                    <label className="form-label">
                      account                    </label>

                    <select
                      name="account"
                      value={cluster.account}
                      className="form-select w-100 bg-light border-0 mb-3"
                      onChange={handleInputChange}
                    >
                      <option value="" disabled>Choose an account</option>
                      {chooseFrom.accounts.map((name, index) => (
                        name.startsWith("aws") &&
                        <option key={index} value={name}>
                          {name}
                        </option>

                      ))}
                    </select>

                    <label className="form-label">
                      region
                    </label>
                    <select
                      type="text"
                      id="region"
                      name="region"
                      value={cluster.region}
                      disabled={disabled.region}
                      className="form-select w-100 bg-light border-0 mb-3"
                      onChange={handleInputChange}
                      required
                    >
                      <option value="" defaultValue disabled>Choose an installation region</option>
                      {regions.map((region, index) => (
                        <option key={index} value={region}>{region}</option>
                      ))}
                    </select>
                    <br />
                    <Separation desc="cluster" />
                    <label className="form-label">
                      cluster Name:
                    </label>
                    <input
                      type="text"
                      className="form-control mb-2"
                      name="clusterName"
                      minLength={6}
                      maxLength={64}
                      value={cluster.clusterName}
                      onChange={handleInputChange}
                      disabled={disabled.clusterName}
                      required
                    />
                    <br />
                    <div className="d-flex justify-content-center mx-4 mt-5 mb-lg-4">
                      <button
                        type="submit"
                        className="btn btn-dark btn-lg"
                        disabled={!(createButtonContent.type === 'span' && createButtonContent.props.children === 'Create')}
                      >{createButtonContent}
                      </button>
                    </div>
                    <br />
                  </form>
                  {terminalOutput && (
                    <>
                      <h4 className="mt-3"> output : </h4>
                      <div className="bg-black text-terminal h6 rounded my-1 p-4"
                        style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
                        {terminalOutput}
                      </div>
                    </>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

