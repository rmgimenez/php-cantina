<?php

namespace Config;

use CodeIgniter\Config\BaseConfig;

/**
 * Cross-Origin Resource Sharing (CORS) Configuration
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
 */
class Cors extends BaseConfig
{
    /**
     * The default CORS configuration.
     *
     * @var array{
     *      allowedOrigins: list<string>,
     *      allowedOriginsPatterns: list<string>,
     *      supportsCredentials: bool,
     *      allowedHeaders: list<string>,
     *      exposedHeaders: list<string>,
     *      allowedMethods: list<string>,
     *      maxAge: int,
     *  }
     */
    public array $default = [];

    /**
     * Build environment-aware defaults.
     * In development we'll allow common local frontend origins (Vite/React).
     * In other environments the config stays conservative; you can override
     * with an environment variable CORS_ALLOWED_ORIGINS (comma-separated).
     */
    public function __construct()
    {
        parent::__construct();

        // Allow override from environment (comma separated list)
        $envOrigins = getenv('CORS_ALLOWED_ORIGINS');
        if ($envOrigins !== false && trim($envOrigins) !== '') {
            $origins = array_map('trim', explode(',', $envOrigins));
        } elseif (defined('ENVIRONMENT') && ENVIRONMENT === 'development') {
            // Common origins used in frontend development (Vite, CRA, etc.)
            $origins = [
                'http://localhost:5173',
                'http://127.0.0.1:5173',
                'http://localhost:5174',
                'http://127.0.0.1:5174',
                'http://localhost:3000',
                'http://127.0.0.1:3000',
            ];
        } else {
            // Production / conservative default: no wildcard; must be configured
            $origins = [];
        }

        $this->default = [
            // Origins for the `Access-Control-Allow-Origin` header.
            'allowedOrigins' => $origins,

            // Origin regex patterns for the `Access-Control-Allow-Origin` header.
            'allowedOriginsPatterns' => [],

            // Whether to send the `Access-Control-Allow-Credentials` header.
            'supportsCredentials' => true,

            // Set headers to allow.
            'allowedHeaders' => ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],

            // Set headers to expose.
            'exposedHeaders' => [],

            // Set methods to allow.
            'allowedMethods' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],

            // Set how many seconds the results of a preflight request can be cached.
            'maxAge' => 7200,
        ];
    }
}
