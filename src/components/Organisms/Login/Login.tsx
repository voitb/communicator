import React, { useContext } from "react";
import {post} from "../../../helpers/api";

import Button from "../../Atoms/Button/Button";
import Input from "../../Atoms/Input/Input";
import "./Login.scss";
import useLogin from "./useLogin";
import { AuthContext } from "./auth";

type Props = {
	activate?: boolean;
	register?: boolean;
	onChange: (type: string, set: () => void) => void;
	onLogin?: Function;
};

const LogIn = (props: Props) => {
	const { activate, register, onChange, onLogin } = props;
	const {
		login,
		password,
		setLogin,
		setPassword,
		passwordRepeat,
		setPasswordRepeat,
		handleReset,
		errorMessage,
		setErrorMessage,
	} = useLogin(register);

	const { isPasswordConfirmed, setToken, setIsPasswordConfirmed } =
		useContext(AuthContext);

	const handleOnClick = async () => {
		if (register) {
			if (password !== passwordRepeat) {
				setErrorMessage("Passwords don't match");
				return;
			}
			try {
				handleReset();
				await post("/users/register", {
					password: password,
					username: login,
				});
				onChange("chat", () => setErrorMessage(""));
			} catch (err) {
				// @ts-ignore
				if (err.response.status === 400) {
					setErrorMessage("Account already exists");
				} else {
					// @ts-ignore
					setErrorMessage(`Unknown error: ${err.message}`);
				}
			}
		} else if (activate) {
			if (password !== passwordRepeat) {
				setErrorMessage("Passwords don't match");
				return;
			}
			try {
				handleReset();
				await post("http://localhost:3005/users/confirm-password", {
					password: password,
					username: login,
				});
				onChange("login", () => setErrorMessage(""));
			} catch (err) {
				// @ts-ignore
				if (err.response.status === 400) {
					setErrorMessage("Account already exists");
				} else {
					// @ts-ignore
					setErrorMessage(`Unknown error: ${err.message}`);
				}
			}
		} else
			try {
				const data = await post("http://localhost:3005/users/login", {
					password: password,
					username: login,
				});

				if (data?.data === false) {
					setErrorMessage("Wrong password");
					return;
				}
				document.cookie = `token=${data?.data?.token}; path=/; max-age=${
					60 * 60 * 24
				};`;
				document.cookie = `user=${login}; path=/; max-age=${60 * 60 * 24};`;
				document.cookie = `currentDate=${Date.now()}; path=/; max-age=${
					60 * 60 * 24
				};`;
				document.cookie = `userId=${data?.data?.id}; path=/; max-age=${
					60 * 60 * 24
				};`;
				console.log(data);
				onLogin && onLogin(login, data?.data?.id);
				setIsPasswordConfirmed(data?.data?.isPasswordConfirmed);
				return setToken(data?.data?.token);
			} catch (err) {
				// @ts-ignore
				setErrorMessage(`Unknown error: ${err.message}`);
				console.log(err);
			}
	};

	return (
		<div className="login">
			<div className="login-container">
				{!activate && (
					<Input
						value={login}
						onChange={setLogin}
						placeholder="login"
						className="login-input"
					/>
				)}
				<Input
					value={password}
					onChange={setPassword}
					placeholder="password"
					type="password"
					className="login-input"
				/>
				{register && (
					<Input
						value={passwordRepeat}
						onChange={setPasswordRepeat}
						placeholder="repeat password"
						type="password"
						className="login-input"
					/>
				)}
				<Button onClick={handleOnClick}>
					{register ? "Register" : "Login"}
				</Button>
				<div className="login-container__text">
					{register && (
						<span onClick={() => onChange("", () => setErrorMessage(""))}>
							{register && "Come back to chat"}
						</span>
					)}
				</div>
				{errorMessage && (
					<div className="login-container__wrong">
						<span>{errorMessage}</span>
					</div>
				)}
			</div>
		</div>
	);
};

export default LogIn;
