async function getCEs(token, account, location, setResult) {
  if (!token)
    return false
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_ADDR}gcp/ce/?` + new URLSearchParams({
        token: token,
        account: account,
        location: location
      }), {
      method: 'GET'
    });

    if (response.ok) {
      let data = await response.json();
      if (data.length == 0)
        data = [{ id: "there is no virtual machines", name: "-", size: "-", status: "-", privateIp: "-", publicIp: "-" }]
      setResult((prevState) => ({
        ...prevState,
        instances: data,
      }))
      return true
    }
    return false
  } catch (error) {
    console.error("something went wrong");
    return false
  }
};


async function getSQLs(token, account, location, setResult, type) {
  if (!token)
    return false
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_ADDR}gcp/sql/?` + new URLSearchParams({
        token: token,
        account: account,
        location: location
      }), {
      method: 'GET'
    });

    const tmp = await response.json();
    let data = tmp.filter((db) => { return db.version.startsWith(type) })

    if (response.ok) {
      if (data.length == 0)
        data = [{ id: "there is no Databases", name: "-", size: "-", status: "-", privateIp: "-", gbs: "-" }]
      setResult((prevState) => ({
        ...prevState,
        instances: data,
      }))
      return true
    }
    return false
  } catch (error) {
    console.error("something went wrong");
    return false
  }
};

async function getStorages(token, account, location, setResult) {
  if (!token)
    return false
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_ADDR}gcp/storage/?` + new URLSearchParams({
        token: token,
        account: account,
        location: location
      }), {
      method: 'GET'
    });

    if (response.ok) {
      let data = await response.json()
      if (data.length == 0)
        data = [{ name: "There is no buckets", storageClass: "-", created: "-", selfLink: "-" }]

      setResult((prevState) => ({
        ...prevState,
        buckets: data,
      }))

      return true
    }
    return false
  } catch (error) {
    console.error("something went wrong");
    return false
  }
};

async function getVPCs(token, account, location, setResult) {
  if (!token)
    return false

  // zone vs location 
  let region;
  if (zones.includes(location)) {
    region = location.substring(0, location.lastIndexOf('-'));
  } else {
    region = location
  }
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_ADDR}gcp/vpc/?` + new URLSearchParams({
        token: token,
        account: account,
        location: region
      }), {
      method: 'GET'
    });

    if (response.ok) {
      let data = await response.json().then((data) => {
        if (data.length == 0)
          data = [{ id: "There is no VPCs", name: "-", autoCreateSubnets: "-", routingMode: "-" }]

        console.warn(data)
        setResult((prevState) => ({
          ...prevState,
          vpcs: data,
        }))
      })

      return true
    }
    return false
  } catch (error) {
    console.error("something went wrong", error);
    return false
  }
};


async function getSubnets(token, account, location, setResult, vpc) {
  if (!token)
    return false

  // zone vs location 
  let region;
  if (zones.includes(location)) {
    region = location.substring(0, location.lastIndexOf('-'));
  } else {
    region = location
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_ADDR}gcp/subnet/?` + new URLSearchParams({
        token: token,
        account: account,
        location: region,
        vpc: vpc
      }), {
      method: 'GET'
    });

    if (response.ok) {
      await response.json().then((data) => {
        if (data.length == 0)
          data = [{ name: "there is no subnets", region: "-", cidrBlock: "-" }]

        console.warn(data)
        setResult((prevState) => ({
          ...prevState,
          subnets: data,
        }))
      })

      return true
    }
    return false
  } catch (error) {
    console.error("something went wrong", error);
    return false
  }
};



// MySQL Versions
const mysqlVersions = [
  "MYSQL_5_6",
  "MYSQL_5_7",
  "MYSQL_8_0"
];

// PostgreSQL Versions
const postgresVersions = [
  "POSTGRES_9_6",
  "POSTGRES_10",
  "POSTGRES_11",
  "POSTGRES_12",
  "POSTGRES_13",
  "POSTGRES_14",
  "POSTGRES_15"
];

// SQL Server Versions
const sqlVersions = [
  "SQLSERVER_2017_STANDARD",
  "SQLSERVER_2017_ENTERPRISE",
  "SQLSERVER_2017_EXPRESS",
  "SQLSERVER_2017_WEB",
  "SQLSERVER_2019_STANDARD",
  "SQLSERVER_2019_ENTERPRISE",
  "SQLSERVER_2019_EXPRESS",
  "SQLSERVER_2019_WEB"
];

const zones = [
  'europe-west1-b',
  'europe-west1-c',
  'europe-west1-d',
  'europe-west2-a',
  'europe-west2-b',
  'us-central1-a',
  'us-central1-b',
  'us-central1-c',
  'us-east1-b',
  'us-east1-c'
];

const regions = [
  "australia-southeast1",
  "australia-southeast2",
  "europe-central2",
  "europe-north1",
  "europe-southwest1",
  "europe-west1",
  "europe-west10",
  "europe-west12",
  "europe-west2",
  "europe-west3",
  "europe-west4",
  "europe-west6",
  "europe-west8",
  "europe-west9",
  "us-central1",
  "us-east1",
  "us-east4",
  "us-east5",
  "us-south1",
  "us-west1",
  "us-west2",
  "us-west3",
  "us-west4"
];

const sizes = [
  "e2-micro",
  "e2-small",
  "e2-medium",  // General purpose with 2 vCPUs, 4 GB memory
  "e2-standard-2",  // General purpose with 2 vCPUs, 8 GB memory
  "e2-standard-4",  // General purpose with 4 vCPUs, 16 GB memory
  "e2-highmem-2",   // High memory with 2 vCPUs, 16 GB memory
  "e2-highmem-4",   // High memory with 4 vCPUs, 32 GB memory
  "e2-highcpu-2",   // High CPU with 2 vCPUs, 8 GB memory
  "e2-highcpu-4",   // High CPU with 4 vCPUs, 16 GB memory
  "n1-standard-1",  // First generation general purpose with 1 vCPU, 3.75 GB memory
  "n1-standard-2",  // First generation general purpose with 2 vCPUs, 7.5 GB memory
  "n1-highmem-2",   // First generation high memory with 2 vCPUs, 13 GB memory
  "n1-highmem-4",   // First generation high memory with 4 vCPUs, 26 GB memory
  "n2-standard-2",  // Second generation general purpose with 2 vCPUs, 7.75 GB memory
  "n2-highmem-2",   // Second generation high memory with 2 vCPUs, 16 GB memory
  "n2-highmem-4",   // Second generation high memory with 4 vCPUs, 32 GB memory
  "n2-highcpu-2",   // Second generation high CPU with 2 vCPUs, 8 GB memory
  "n2-highcpu-4",   // Second generation high CPU with 4 vCPUs, 16 GB memory
  "t2d-micro",     // Burstable micro with shared vCPU, 1 GB memory
  "t2d-small",      // Burstable small with shared vCPU, 2 GB memory
];


const dbSizes = [
  { name: "db-f1-micro", memory: "0.6 GB", cpu: "1 vCPU" },
  { name: "db-g1-small", memory: "1.7 GB", cpu: "1 vCPU" },
  { name: "db-n1-standard-1", memory: "3.75 GB", cpu: "1 vCPU" },
  { name: "db-n1-standard-2", memory: "7.5 GB", cpu: "2 vCPUs" },
  { name: "db-n1-standard-4", memory: "15 GB", cpu: "4 vCPUs" },
  { name: "db-n1-standard-8", memory: "30 GB", cpu: "8 vCPUs" },
  { name: "db-n1-standard-16", memory: "60 GB", cpu: "16 vCPUs" },
  { name: "db-n1-standard-32", memory: "120 GB", cpu: "32 vCPUs" },
  { name: "db-n1-standard-64", memory: "240 GB", cpu: "64 vCPUs" },
  { name: "db-n1-standard-96", memory: "360 GB", cpu: "96 vCPUs" },
  { name: "db-n1-highmem-2", memory: "13 GB", cpu: "2 vCPUs" },
  { name: "db-n1-highmem-4", memory: "26 GB", cpu: "4 vCPUs" },
  { name: "db-n1-highmem-8", memory: "52 GB", cpu: "8 vCPUs" },
  { name: "db-n1-highmem-16", memory: "104 GB", cpu: "16 vCPUs" },
  { name: "db-n1-highmem-32", memory: "208 GB", cpu: "32 vCPUs" },
  { name: "db-n1-highmem-64", memory: "416 GB", cpu: "64 vCPUs" },
  { name: "db-n1-highmem-96", memory: "624 GB", cpu: "96 vCPUs" },
];





export { zones, regions, sizes, dbSizes, mysqlVersions, postgresVersions, sqlVersions, getCEs, getSQLs, getStorages, getVPCs, getSubnets }
