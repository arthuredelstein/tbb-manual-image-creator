let request = async (cmd, params) => {
  console.log(cmd, params);
  console.log(JSON.stringify(params));
  let response = await fetch(`/${cmd}`, {
    method: "post",
    body: JSON.stringify(params),
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
  return response.json();
};

