#pragma once


#include "../fals/main_server.hpp"
#include "locale.hpp"


class fals_LOCALE {
public:
	static std::shared_ptr<server_response> process_get(req request) {
		if (request->api.size() == 4) {
			auto locales = Locale::get_locales();

			if (request->api[3] == "list") {
				nlohmann::json js = nlohmann::json::array();

				for (Locale* locale : locales) {
					js.push_back(locale->_name);
				}

				return text_resp(request->socket, 200, "OK", "application/json", js.dump());
			}

			auto locale = std::find_if(locales.begin(), locales.end(), [&](Locale* locale) {
				return locale->_name == request->api[3];
			});

			if (locale != locales.end()) {
				return (*locale)->get(request);
			}
		}

		return text_resp();
	}


	static std::shared_ptr<server_response> process_post(req request) {
		if (request->api.size() == 4) {
			auto locales = Locale::get_locales();

			auto locale = std::find_if(locales.begin(), locales.end(), [&](Locale* locale) {
				return locale->_name == request->api[3];
				});

			if (locale != locales.end()) {
				return (*locale)->set(request);
			}
		}

		return text_resp();
	}


	static void init() {
		fals::mkdir_if_not_exists("storage");
		fals::mkdir_if_not_exists("storage/locales");
	}
};