#pragma once


#include "../internal.hpp"


#include <nlohmann/json.hpp>
#include <fstream>


class fals_GLOBAL {
public:
	static inline std::string secret{ "default-secret-key" };


	static std::string get_this_file() {
		return "storage/globals/settings.json";
	}


	static void change_secret(const std::string& new_secret) {
		std::string path = get_this_file();

		nlohmann::json js;

		{
			std::ifstream ifile{ path };
			if (ifile.is_open())
				js = nlohmann::json::parse(ifile);
		}

		secret = new_secret;
		js["secret"] = secret;

		std::ofstream ofile{ path };
		ofile << js.dump();

	}


	static void init() {
		std::string path = get_this_file();

		if (std::filesystem::exists(path)) {
			std::ifstream ifile{ path };
			nlohmann::json js = nlohmann::json::parse(ifile);

			if (js.contains("secret")) {
				secret = js["secret"];
			}
		}

		fals::mkdir_if_not_exists("storage");
		fals::mkdir_if_not_exists("storage/globals");
	}
};