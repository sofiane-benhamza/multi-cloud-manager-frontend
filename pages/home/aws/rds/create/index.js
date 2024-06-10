import { useState, useContext, useEffect } from 'react';
import { regions } from "@/utils/aws";
import { getCredentials, Separation } from '@/utils/general';
import { AuthContext } from "@/pages/_app";

export default function CreateRDS({ setWarning, setToken }) {

  const { token } = useContext(AuthContext);

  const INIT = {
    database: {
      account: "",
      region: "",
      dbName: '',
      allocatedStorage: 20,
      engine: '',
      engineVersion: '',
      port: 5432,
      instanceClass: '',
      username: '',
      password: '',
      confirmationPassword: "",
      multiAZ: false,
      encrypted: false,
      skipFinalSnapshot: false,
    },
    disabled: {
      region: true,
      dbName: true,
      allocatedStorage: true,
      engine: true,
      engineVersion: true,
      port: true,
      instanceClass: true,
      username: true,
    },
    chooseFrom: {
      accounts: ["LOADING ..."],
      engineVersions: [],
      engines: [
        "aurora-mysql", "aurora-postgresql", "mariadb",
        "mysql", "oracle-ee", "oracle-ee-cdb", "oracle-se2",
        "oracle-se2-cdb", "postgres", "sqlserver-ee", "sqlserver-se",
        "sqlserver-ex", "sqlserver-web"
      ],
      instanceClasses: ["db.t2.micro", "db.t3.micro", "db.t3.small", "db.t3.medium", "db.t3.large", "db.t3.xlarge", "db.t3.2xlarge", "db.t2.small", "db.t2.medium", "db.t2.large", "db.m5.large", "db.m5.xlarge", "db.m5.2xlarge", "db.m5.4xlarge", "db.m5.12xlarge", "db.m5.24xlarge", "db.m4.large", "db.m4.xlarge", "db.m4.2xlarge", "db.m4.4xlarge", "db.m4.10xlarge", "db.m4.16xlarge", "db.r5.large", "db.r5.xlarge", "db.r5.2xlarge", "db.r5.4xlarge", "db.r5.12xlarge", "db.r5.24xlarge", "db.r4.large", "db.r4.xlarge", "db.r4.2xlarge", "db.r4.4xlarge", "db.r4.8xlarge", "db.r4.16xlarge", "db.x1e.xlarge", "db.x1e.2xlarge", "db.x1e.4xlarge", "db.x1e.8xlarge", "db.x1e.16xlarge", "db.x1e.32xlarge", "db.x1.16xlarge", "db.x1.32xlarge", "db.z1d.large", "db.z1d.xlarge", "db.z1d.2xlarge", "db.z1d.3xlarge", "db.z1d.6xlarge", "db.z1d.12xlarge", "db.m6g.large", "db.m6g.xlarge", "db.m6g.2xlarge", "db.m6g.4xlarge", "db.m6g.8xlarge", "db.m6g.12xlarge", "db.m6g.16xlarge", "db.m6g.metal", "db.c6g.large", "db.c6g.xlarge", "db.c6g.2xlarge", "db.c6g.4xlarge", "db.c6g.8xlarge", "db.c6g.12xlarge", "db.c6g.16xlarge", "db.c6g.metal", "db.r6g.large", "db.r6g.xlarge", "db.r6g.2xlarge", "db.r6g.4xlarge", "db.r6g.8xlarge", "db.r6g.12xlarge", "db.r6g.16xlarge", "db.r6g.metal", "db.t4g.large", "db.t4g.xlarge", "db.t4g.2xlarge", "db.t4g.metal",]
    }
  }

  const [database, setDatabase] = useState(INIT.database);
  const [chooseFrom, setChooseFrom] = useState(INIT.chooseFrom)
  const [disabled, setDisabled] = useState(INIT.disabled)

  const [terminalOutput, setTerminalOutput] = useState("");


  const databaseArray = Object.keys(database);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const index = databaseArray.indexOf(name);
    (index !== -1) && setDisabled((prev) => ({ ...prev, [databaseArray[index]]: true, [databaseArray[index + 1]]: false }))
    name === "account" && setDatabase(INIT.database);
    name === "engine" && getEngineVersions(value);
    setDatabase({ ...database, [name]: value });
  };

  const handleCreateRDS = async (e) => {
    e.preventDefault();
    setCreateButtonContent(
      <span>
        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> please wait
      </span>
    );
    if (database.password !== database.confirmationPassword) {
      setWarning({
        message: "passwords does not match !",
        type: "danger",
        isShown: true
      })
      return false;
    }
    try {
      const databaseConfig = new FormData();
      databaseConfig.append("token", token); //token authentication

      for (const key in database) {
        if (database.hasOwnProperty(key) && key !== "confirmationPassword") {
          databaseConfig.append(key, database[key]);
        }
      }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_ADDR}terraform/aws/rds/?`,
        {
          method: "POST",
          body: databaseConfig
        }
      );
      const data = await response.json();
      if (response.ok) {
        setWarning({
          message: "database " + database.dbName + " created succesfully",
          type: "success",
          isShown: true
        })
        setTerminalOutput(data.stdOut);
        return true
      } else {
        setWarning({
          message: "something went wrong",
          type: "danger",
          isShown: true
        })
        setTerminalOutput(data.stdErr);
        return false
      }
    } catch (err) {
      setWarning({
        message: "something went wrong, please try again or contact support.",
        type: "danger",
        isShown: true
      });
      return false
    } finally {
      setCreateButtonContent(<span>Create</span>);
    }

  };

  const getEngineVersions = async (engine) => {
    setChooseFrom((prev) => ({ ...prev, engineVersions: ["LOADING ..."] }))
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_ADDR}aws/rds?` +
        new URLSearchParams({
          token: token,
          region: database.region,
          uniqueName: database.account,
          service: "engines",
          engine: engine
        }),
        {
          method: "GET",
        }
      );
      if (response.ok) {
        let data = await response.json();
        if (data.error) {
          data = ["something went wrong"]
        }
        setChooseFrom((prev) => ({ ...prev, engineVersions: data }))
        return true;
      }
    } catch (err) {
      setChooseFrom((prev) => ({ ...prev, engineVersions: [] }))
      console.error(err)
    }
  }

  useEffect(() => {
    getCredentials(token, setChooseFrom).then((isOk) => {
      if (!isOk) setToken("expired")
    });;

  }, [token, setToken]);

  const [createButtonContent, setCreateButtonContent] = useState(<span>Create</span>);


  return (
    <div className=" d-flex align-items-center justify-content-center p-5 tilt-warp-title">
      <div className="row d-flex justify-content-center align-items-center col-xl-5 col-lg-6 col-md-8 col-sm-10 col-xs-12">
        <div className="border border-dark rounded mt-3">
          <div
            className="bg-transparent text-dark rounded"
          >
            <div className="card-body p-md-5 ">
              <div className="row justify-content-center d-flex p-3  justify-content-center align-items-center">
                <div className="w-100">
                  <form onSubmit={handleCreateRDS}>
                    <h3 className="d-flex flex-row">
                      <p>create a database</p>
                      <button
                        className="btn btn-light btn-lg ml-auto" title="Reset">
                        <i className="bi bi-trash3-fill cursor-pointer"
                          onClick={() => {
                            setDB(INIT.DB);
                            setDisabled(INIT.DISABLED);
                            setChooseFrom((prev) => ({
                              accounts: prev.accounts,
                            }))
                            setCreateButtonContent(<span>Create</span>)
                          }}></i>
                      </button>
                    </h3>
                    <p className="alert alert-info m-2 mt-4">
                      <i className="bi bi-info-circle mr-2"></i>
                      It may take up to 10 minutes to create a Database properly.
                    </p>

                    <label className="form-label">
                      account                    </label>

                    <select
                      name="account"
                      value={database.account}
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
                      value={database.region}
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
                    <Separation desc="database" />
                    <label className="form-label">
                      Database Name:
                    </label>
                    <input
                      type="text"
                      className="form-control mb-2"
                      name="dbName"
                      minLength={6}
                      maxLength={64}
                      value={database.dbName}
                      onChange={handleInputChange}
                      disabled={disabled.dbName}
                      required
                    />
                    <label className="form-label mt-3">
                      Allocated Storage (GBs):
                    </label>
                    <input
                      type="number"
                      name="allocatedStorage"
                      className="form-control mb-2"
                      value={database.allocatedStorage}
                      min="20"
                      max="1000"
                      onChange={handleInputChange}
                      disabled={disabled.allocatedStorage}
                      required
                    />
                    <label className="form-label my-3">
                      Engine:
                    </label>
                    <select
                      name="engine"
                      value={database.engine}
                      className="form-select w-100 bg-light border-0 mb-3"
                      onChange={handleInputChange}
                      disabled={disabled.engine}
                      required
                    >
                      <option value="" disabled>choose an engine</option>
                      {chooseFrom.engines.map((engine, index) => (

                        <option key={index} value={engine}>
                          {engine}
                        </option>

                      ))}

                    </select>
                    <label className="form-label">
                      Engine Version:
                    </label>
                    <select
                      name="engineVersion"
                      value={database.engineVersion}
                      className="form-select w-100 bg-light border-0 mb-3"
                      onChange={handleInputChange}
                      disabled={disabled.engineVersion}
                      required
                    >
                      <option value="" disabled>choose a version</option>
                      {chooseFrom.engineVersions.map((engineVersion, index) => (

                        <option key={index} value={engineVersion} disabled={engineVersion === "something went wrong"}>
                          {engineVersion}
                        </option>

                      ))}

                    </select>
                    <label className="form-label my-2">
                      Database port:
                    </label>
                    <input
                      type="number"
                      name="port"
                      className="form-control mb-2"
                      value={database.port}
                      min="1023"
                      max="65535"
                      onChange={handleInputChange}
                      disabled={disabled.port}
                      required
                    />
                    <label className="form-label my-2">
                      Instance Class:
                    </label>
                    <select
                      name="instanceClass"
                      value={database.instanceClass}
                      className="form-select w-100 bg-light border-0 mb-3"
                      onChange={handleInputChange}
                      disabled={disabled.instanceClass}
                    >
                      <option value="" disabled>Choose a class</option>
                      {chooseFrom.instanceClasses.map((instanceClass, index) => (

                        <option key={index} value={instanceClass}>

                          {instanceClass}

                        </option>

                      ))}
                    </select>
                    <label className="form-label">
                      Master username:
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={database.username}
                      className="form-control mb-2"
                      minLength={6}
                      maxLength={32}
                      onChange={handleInputChange}
                      disabled={disabled.username}
                      required
                    />
                    <label className="form-label">
                      Master password:
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={database.password}
                      minLength={8}
                      maxLength={64}
                      className="form-control mb-2"
                      onChange={handleInputChange}
                      disabled={disabled.username}
                      required
                    />
                    <label className="form-label">
                      Confirm master password:
                    </label>
                    <input
                      type="password"
                      name="confirmationPassword"
                      minLength={8}
                      maxLength={64}
                      value={database.confirmationPassword}
                      className="form-control mb-2"
                      onChange={handleInputChange}
                      disabled={disabled.username}
                      required
                    />
                    <input
                      className='my-2'
                      type="checkbox"
                      checked={database.encrypted}
                      name="encrypted"
                      onChange={(e) =>
                        setDatabase({ ...database, encrypted: e.target.checked })
                      }
                      style={{ accentColor: "black" }}
                      disabled={disabled.username}
                    />&nbsp;&nbsp;&nbsp;Storage encrypted <br />

                    <input
                      className='my-2'
                      type="checkbox"
                      checked={database.multiAZ}
                      name="skipFinalSnapshot"
                      onChange={(e) =>
                        setDatabase({ ...database, multiAZ: e.target.checked })
                      }
                      style={{ accentColor: "black" }}
                      disabled={disabled.username}
                    />&nbsp;&nbsp;&nbsp;Multi availability Zone <br />
                    <input
                      className='my-2'
                      type="checkbox"
                      checked={database.skipFinalSnapshot}
                      name="skipFinalSnapshot"
                      onChange={(e) =>
                        setDatabase({ ...database, skipFinalSnapshot: e.target.checked })
                      }
                      style={{ accentColor: "black" }}
                      disabled={disabled.username}
                    />&nbsp;&nbsp;&nbsp;Skip Final Snapshot


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

