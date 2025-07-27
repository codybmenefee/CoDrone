"""
S3/MinIO storage utilities for Canopy Copilot
"""

import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from minio import Minio
from minio.error import S3Error
import aiofiles
import os
import uuid
from typing import Optional, List, Dict, Any
import logging
from datetime import datetime, timedelta

from utils.config import settings

logger = logging.getLogger(__name__)


class StorageManager:
    """Manages file storage operations with S3/MinIO"""
    
    def __init__(self):
        self.s3_client = None
        self.minio_client = None
        self._init_clients()
    
    def _init_clients(self):
        """Initialize S3 and MinIO clients"""
        try:
            # Initialize S3 client (for AWS S3 or compatible services)
            self.s3_client = boto3.client(
                's3',
                endpoint_url=settings.S3_ENDPOINT,
                aws_access_key_id=settings.S3_ACCESS_KEY,
                aws_secret_access_key=settings.S3_SECRET_KEY,
                region_name=settings.S3_REGION,
                use_ssl=settings.S3_SECURE
            )
            
            # Initialize MinIO client (alternative interface)
            self.minio_client = Minio(
                settings.S3_ENDPOINT.replace('http://', '').replace('https://', ''),
                access_key=settings.S3_ACCESS_KEY,
                secret_key=settings.S3_SECRET_KEY,
                secure=settings.S3_SECURE
            )
            
            # Ensure bucket exists
            self._ensure_bucket_exists()
            
        except Exception as e:
            logger.error(f"Failed to initialize storage clients: {e}")
            raise
    
    def _ensure_bucket_exists(self):
        """Ensure the main bucket exists"""
        try:
            if not self.minio_client.bucket_exists(settings.S3_BUCKET):
                self.minio_client.make_bucket(settings.S3_BUCKET)
                logger.info(f"Created bucket: {settings.S3_BUCKET}")
        except S3Error as e:
            logger.error(f"Failed to create bucket: {e}")
            raise
    
    async def upload_file(self, file_path: str, s3_key: str, 
                         content_type: Optional[str] = None) -> Dict[str, Any]:
        """Upload a file to S3/MinIO"""
        try:
            # Determine content type if not provided
            if not content_type:
                content_type = self._get_content_type(file_path)
            
            # Upload using MinIO client
            self.minio_client.fput_object(
                settings.S3_BUCKET,
                s3_key,
                file_path,
                content_type=content_type
            )
            
            # Generate presigned URL for access
            url = self.minio_client.presigned_get_object(
                settings.S3_BUCKET,
                s3_key,
                expires=timedelta(hours=24)
            )
            
            return {
                "s3_key": s3_key,
                "url": url,
                "bucket": settings.S3_BUCKET,
                "content_type": content_type,
                "size": os.path.getsize(file_path)
            }
            
        except Exception as e:
            logger.error(f"Failed to upload file {file_path}: {e}")
            raise
    
    async def upload_bytes(self, data: bytes, s3_key: str, 
                          content_type: str = "application/octet-stream") -> Dict[str, Any]:
        """Upload bytes data to S3/MinIO"""
        try:
            # Create temporary file
            temp_path = os.path.join(settings.TEMP_DIR, f"temp_{uuid.uuid4()}")
            
            async with aiofiles.open(temp_path, 'wb') as f:
                await f.write(data)
            
            # Upload the temporary file
            result = await self.upload_file(temp_path, s3_key, content_type)
            
            # Clean up temporary file
            os.remove(temp_path)
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to upload bytes: {e}")
            raise
    
    async def download_file(self, s3_key: str, local_path: str) -> str:
        """Download a file from S3/MinIO"""
        try:
            self.minio_client.fget_object(
                settings.S3_BUCKET,
                s3_key,
                local_path
            )
            return local_path
            
        except Exception as e:
            logger.error(f"Failed to download file {s3_key}: {e}")
            raise
    
    async def get_file_url(self, s3_key: str, expires: int = 3600) -> str:
        """Get a presigned URL for file access"""
        try:
            return self.minio_client.presigned_get_object(
                settings.S3_BUCKET,
                s3_key,
                expires=timedelta(seconds=expires)
            )
        except Exception as e:
            logger.error(f"Failed to generate URL for {s3_key}: {e}")
            raise
    
    async def delete_file(self, s3_key: str) -> bool:
        """Delete a file from S3/MinIO"""
        try:
            self.minio_client.remove_object(settings.S3_BUCKET, s3_key)
            return True
        except Exception as e:
            logger.error(f"Failed to delete file {s3_key}: {e}")
            return False
    
    async def list_files(self, prefix: str = "", max_keys: int = 1000) -> List[Dict[str, Any]]:
        """List files in the bucket with optional prefix"""
        try:
            objects = self.minio_client.list_objects(
                settings.S3_BUCKET,
                prefix=prefix,
                recursive=True
            )
            
            files = []
            for obj in objects:
                files.append({
                    "key": obj.object_name,
                    "size": obj.size,
                    "last_modified": obj.last_modified,
                    "etag": obj.etag
                })
                
                if len(files) >= max_keys:
                    break
            
            return files
            
        except Exception as e:
            logger.error(f"Failed to list files: {e}")
            return []
    
    def _get_content_type(self, file_path: str) -> str:
        """Get content type based on file extension"""
        ext = os.path.splitext(file_path)[1].lower()
        
        content_types = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.tiff': 'image/tiff',
            '.tif': 'image/tiff',
            '.geotiff': 'image/tiff',
            '.pdf': 'application/pdf',
            '.json': 'application/json',
            '.zip': 'application/zip'
        }
        
        return content_types.get(ext, 'application/octet-stream')
    
    def generate_s3_key(self, project_id: str, file_type: str, filename: str) -> str:
        """Generate a structured S3 key for files"""
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        ext = os.path.splitext(filename)[1]
        
        return f"projects/{project_id}/{file_type}/{timestamp}_{uuid.uuid4()}{ext}"
    
    async def get_file_info(self, s3_key: str) -> Optional[Dict[str, Any]]:
        """Get file information"""
        try:
            stat = self.minio_client.stat_object(settings.S3_BUCKET, s3_key)
            return {
                "key": s3_key,
                "size": stat.size,
                "last_modified": stat.last_modified,
                "etag": stat.etag,
                "content_type": stat.content_type
            }
        except Exception as e:
            logger.error(f"Failed to get file info for {s3_key}: {e}")
            return None


# Global storage manager instance
storage_manager = StorageManager()